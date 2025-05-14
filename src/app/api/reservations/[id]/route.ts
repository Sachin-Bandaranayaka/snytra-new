import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET endpoint to retrieve a specific reservation
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const reservationId = params.id;

        // Verify authentication for protected info or verify ownership
        const session = await getServerSession(authOptions);

        // Get phone from query if trying to verify ownership
        const { searchParams } = new URL(request.url);
        const phone = searchParams.get('phone');

        // Base query to get reservation details
        let query = `
            SELECT r.id, r.name, r.email, r.phone_number, 
                   r.party_size, r.date, r.time, 
                   r.special_instructions, r.status, r.table_id,
                   t.table_number
            FROM reservations r
            LEFT JOIN tables t ON r.table_id = t.id
            WHERE r.id = $1
        `;

        const queryParams = [reservationId];

        // If verifying with phone number, add it to the query
        if (phone && !session) {
            query += ` AND r.phone_number = $2`;
            queryParams.push(phone);
        }

        // Execute query
        const result = await pool.query(query, queryParams);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
        }

        const row = result.rows[0];

        // Determine if this is a public (by phone) or authenticated request
        const isPublic = !session && phone;

        // Format response
        const reservation = isPublic
            ? {
                id: row.id,
                customerName: row.name,
                date: row.date,
                time: row.time,
                partySize: row.party_size,
                status: row.status
            }
            : {
                id: row.id,
                customerName: row.name,
                customerEmail: row.email,
                customerPhone: row.phone_number,
                partySize: row.party_size,
                date: row.date,
                time: row.time,
                specialRequests: row.special_instructions,
                status: row.status,
                tableId: row.table_id,
                tableNumber: row.table_number
            };

        return NextResponse.json({ reservation });
    } catch (error) {
        console.error('Error fetching reservation:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reservation' },
            { status: 500 }
        );
    }
}

// PUT endpoint to update a reservation
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const reservationId = params.id;

        // Verify authentication for staff actions
        const session = await getServerSession(authOptions);
        const verifyPhone = !session; // If no session, must verify by phone

        // Extract reservation data from request
        const {
            customerName,
            customerEmail,
            customerPhone,
            partySize,
            date,
            time,
            specialRequests,
            status,
            tableId,
            phone // Used for verification if not authenticated
        } = await request.json();

        // First check if the reservation exists
        let checkQuery = `SELECT * FROM reservations WHERE id = $1`;
        let checkParams = [reservationId];

        // If verifying by phone, add phone check to query
        if (verifyPhone) {
            if (!phone) {
                return NextResponse.json(
                    { error: 'Phone number is required for verification' },
                    { status: 401 }
                );
            }
            checkQuery += ` AND phone_number = $2`;
            checkParams.push(phone);
        }

        const checkResult = await pool.query(checkQuery, checkParams);

        if (checkResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Reservation not found or unauthorized' },
                { status: 404 }
            );
        }

        const currentReservation = checkResult.rows[0];

        // Public users can only modify limited fields
        if (verifyPhone) {
            // Public users can only update non-critical fields
            // and can't change status or table
            const limitedUpdate = await pool.query(
                `UPDATE reservations 
                 SET name = $1, 
                     email = $2, 
                     party_size = $3, 
                     special_instructions = $4
                 WHERE id = $5 AND phone_number = $6
                 RETURNING *`,
                [
                    customerName || currentReservation.name,
                    customerEmail || currentReservation.email,
                    partySize || currentReservation.party_size,
                    specialRequests !== undefined ? specialRequests : currentReservation.special_instructions,
                    reservationId,
                    phone
                ]
            );

            if (limitedUpdate.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Failed to update reservation' },
                    { status: 400 }
                );
            }

            const updatedReservation = limitedUpdate.rows[0];

            return NextResponse.json({
                message: 'Reservation updated successfully',
                reservation: {
                    id: updatedReservation.id,
                    customerName: updatedReservation.name,
                    customerEmail: updatedReservation.email,
                    partySize: updatedReservation.party_size,
                    date: updatedReservation.date,
                    time: updatedReservation.time,
                    specialRequests: updatedReservation.special_instructions,
                    status: updatedReservation.status
                }
            });
        }

        // For staff/admin, allow full update
        // Check if date/time are being changed, and if so, validate availability
        if ((date && date !== currentReservation.date) || (time && time !== currentReservation.time)) {
            // Validate new date and time if changing
            const newDate = date || currentReservation.date;
            const newTime = time || currentReservation.time;

            // Ensure the new time slot is valid
            if (newDate && newTime) {
                const newDateTime = new Date(`${newDate}T${newTime}:00`);
                const now = new Date();

                if (newDateTime <= now) {
                    return NextResponse.json(
                        { error: 'Reservation date and time must be in the future' },
                        { status: 400 }
                    );
                }

                // Check if the time slot is available
                const reservationsCountResult = await pool.query(
                    `SELECT COUNT(*) as count 
                     FROM reservations 
                     WHERE date = $1 AND time = $2 AND status IN ('pending', 'confirmed') AND id != $3`,
                    [newDate, newTime, reservationId]
                );

                const dayOfWeek = new Date(newDate).getDay();

                const settingsResult = await pool.query(
                    'SELECT * FROM reservation_settings WHERE day_of_week = $1 AND is_active = true',
                    [dayOfWeek]
                );

                if (settingsResult.rows.length === 0) {
                    return NextResponse.json(
                        { error: 'Reservations are not available for this day' },
                        { status: 400 }
                    );
                }

                const settings = settingsResult.rows[0];
                const openTime = new Date(`${newDate}T${settings.open_time}`);
                const closeTime = new Date(`${newDate}T${settings.close_time}`);

                if (newDateTime < openTime || newDateTime >= closeTime) {
                    return NextResponse.json(
                        { error: 'Reservation time is outside of business hours' },
                        { status: 400 }
                    );
                }

                const currentReservations = parseInt(reservationsCountResult.rows[0].count);
                const tablesPerInterval = settings.tables_per_interval;

                const availableTablesResult = await pool.query(
                    `SELECT COUNT(*) as count 
                     FROM tables 
                     WHERE status != 'maintenance'`,
                    []
                );

                const availableTables = parseInt(availableTablesResult.rows[0].count);

                if (currentReservations >= (tablesPerInterval || availableTables)) {
                    return NextResponse.json(
                        { error: 'No tables available for this time slot' },
                        { status: 400 }
                    );
                }
            }
        }

        // If changing the table, update the old and new table statuses
        let oldTableId = currentReservation.table_id;

        if (tableId !== undefined && tableId !== oldTableId) {
            try {
                // Start a transaction
                await pool.query('BEGIN');

                // If there was a previous table, update its status back to available
                if (oldTableId) {
                    await pool.query(
                        `UPDATE tables SET status = 'available' WHERE id = $1`,
                        [oldTableId]
                    );
                }

                // If assigning a new table, update its status to reserved
                if (tableId) {
                    await pool.query(
                        `UPDATE tables SET status = 'reserved' WHERE id = $1`,
                        [tableId]
                    );
                }

                // Update the reservation with the new table and potentially other fields
                const updateResult = await pool.query(
                    `UPDATE reservations 
                     SET name = $1,
                         email = $2,
                         phone_number = $3,
                         party_size = $4,
                         date = $5,
                         time = $6,
                         special_instructions = $7,
                         status = $8,
                         table_id = $9
                     WHERE id = $10
                     RETURNING *`,
                    [
                        customerName || currentReservation.name,
                        customerEmail || currentReservation.email,
                        customerPhone || currentReservation.phone_number,
                        partySize || currentReservation.party_size,
                        date || currentReservation.date,
                        time || currentReservation.time,
                        specialRequests !== undefined ? specialRequests : currentReservation.special_instructions,
                        status || currentReservation.status,
                        tableId,
                        reservationId
                    ]
                );

                // Commit the transaction
                await pool.query('COMMIT');

                if (updateResult.rows.length === 0) {
                    return NextResponse.json(
                        { error: 'Failed to update reservation' },
                        { status: 400 }
                    );
                }

                // Get updated reservation with table info
                const getUpdatedResult = await pool.query(
                    `SELECT r.*, t.table_number
                     FROM reservations r
                     LEFT JOIN tables t ON r.table_id = t.id
                     WHERE r.id = $1`,
                    [reservationId]
                );

                const updatedReservation = getUpdatedResult.rows[0];

                return NextResponse.json({
                    message: 'Reservation updated successfully',
                    reservation: {
                        id: updatedReservation.id,
                        customerName: updatedReservation.name,
                        customerEmail: updatedReservation.email,
                        customerPhone: updatedReservation.phone_number,
                        partySize: updatedReservation.party_size,
                        date: updatedReservation.date,
                        time: updatedReservation.time,
                        specialRequests: updatedReservation.special_instructions,
                        status: updatedReservation.status,
                        tableId: updatedReservation.table_id,
                        tableNumber: updatedReservation.table_number
                    }
                });
            } catch (error) {
                // Rollback in case of error
                await pool.query('ROLLBACK');
                throw error;
            }
        } else {
            // Simple update without changing tables
            const updateResult = await pool.query(
                `UPDATE reservations 
                 SET name = $1,
                     email = $2,
                     phone_number = $3,
                     party_size = $4,
                     date = $5,
                     time = $6,
                     special_instructions = $7,
                     status = $8
                 WHERE id = $9
                 RETURNING *`,
                [
                    customerName || currentReservation.name,
                    customerEmail || currentReservation.email,
                    customerPhone || currentReservation.phone_number,
                    partySize || currentReservation.party_size,
                    date || currentReservation.date,
                    time || currentReservation.time,
                    specialRequests !== undefined ? specialRequests : currentReservation.special_instructions,
                    status || currentReservation.status,
                    reservationId
                ]
            );

            if (updateResult.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Failed to update reservation' },
                    { status: 400 }
                );
            }

            // Get updated reservation with table info
            const getUpdatedResult = await pool.query(
                `SELECT r.*, t.table_number
                 FROM reservations r
                 LEFT JOIN tables t ON r.table_id = t.id
                 WHERE r.id = $1`,
                [reservationId]
            );

            const updatedReservation = getUpdatedResult.rows[0];

            return NextResponse.json({
                message: 'Reservation updated successfully',
                reservation: {
                    id: updatedReservation.id,
                    customerName: updatedReservation.name,
                    customerEmail: updatedReservation.email,
                    customerPhone: updatedReservation.phone_number,
                    partySize: updatedReservation.party_size,
                    date: updatedReservation.date,
                    time: updatedReservation.time,
                    specialRequests: updatedReservation.special_instructions,
                    status: updatedReservation.status,
                    tableId: updatedReservation.table_id,
                    tableNumber: updatedReservation.table_number
                }
            });
        }
    } catch (error) {
        console.error('Error updating reservation:', error);
        return NextResponse.json(
            { error: 'Failed to update reservation' },
            { status: 500 }
        );
    }
}

// DELETE endpoint to cancel a reservation
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const reservationId = params.id;

        // Verify authentication or verify by phone
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(request.url);
        const phone = searchParams.get('phone');

        // Check if the reservation exists
        let checkQuery = `SELECT * FROM reservations WHERE id = $1`;
        let checkParams = [reservationId];

        // If not authenticated, verify by phone
        if (!session) {
            if (!phone) {
                return NextResponse.json(
                    { error: 'Phone number is required for verification' },
                    { status: 401 }
                );
            }
            checkQuery += ` AND phone_number = $2`;
            checkParams.push(phone);
        }

        const checkResult = await pool.query(checkQuery, checkParams);

        if (checkResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Reservation not found or unauthorized' },
                { status: 404 }
            );
        }

        const reservation = checkResult.rows[0];

        // For authenticated staff, actually delete the reservation
        if (session && (session.user as any)?.role === 'admin') {
            // Begin transaction
            await pool.query('BEGIN');

            try {
                // If there's a table assigned, free it
                if (reservation.table_id) {
                    await pool.query(
                        `UPDATE tables SET status = 'available' WHERE id = $1`,
                        [reservation.table_id]
                    );
                }

                // Delete the reservation
                await pool.query('DELETE FROM reservations WHERE id = $1', [reservationId]);

                // Commit transaction
                await pool.query('COMMIT');

                return NextResponse.json({
                    message: 'Reservation deleted successfully'
                });
            } catch (error) {
                // Rollback in case of error
                await pool.query('ROLLBACK');
                throw error;
            }
        } else {
            // For customers, just mark as canceled
            // Begin transaction
            await pool.query('BEGIN');

            try {
                // If there's a table assigned, free it
                if (reservation.table_id) {
                    await pool.query(
                        `UPDATE tables SET status = 'available' WHERE id = $1`,
                        [reservation.table_id]
                    );
                }

                // Update status to canceled
                await pool.query(
                    `UPDATE reservations SET status = 'canceled', table_id = NULL WHERE id = $1`,
                    [reservationId]
                );

                // Commit transaction
                await pool.query('COMMIT');

                return NextResponse.json({
                    message: 'Reservation canceled successfully'
                });
            } catch (error) {
                // Rollback in case of error
                await pool.query('ROLLBACK');
                throw error;
            }
        }
    } catch (error) {
        console.error('Error canceling reservation:', error);
        return NextResponse.json(
            { error: 'Failed to cancel reservation' },
            { status: 500 }
        );
    }
} 