import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendReservationConfirmation } from '@/lib/nodemailer';

// GET endpoint to retrieve reservations with optional filters
export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');
    const phone = url.searchParams.get('phone');

    try {
        let query;
        let params: any[] = [];

        if (email) {
            // Get reservations by email
            query = `
            SELECT r.*, t.table_number, t.seats 
            FROM reservations r
            LEFT JOIN tables t ON r.table_id = t.id
            WHERE r.email = $1 AND r.date >= CURRENT_DATE
            ORDER BY r.date, r.time
            LIMIT 5
            `;
            params = [email];
        } else if (phone) {
            // Get reservations by phone
            query = `
            SELECT r.*, t.table_number, t.seats 
            FROM reservations r
            LEFT JOIN tables t ON r.table_id = t.id
            WHERE r.phone_number = $1 AND r.date >= CURRENT_DATE
            ORDER BY r.date, r.time
            LIMIT 5
            `;
            params = [phone];
        } else {
            // Get all upcoming reservations (for admin view)
            query = `
            SELECT r.*, t.table_number, t.seats 
            FROM reservations r
            LEFT JOIN tables t ON r.table_id = t.id
            WHERE r.date >= CURRENT_DATE
            ORDER BY r.date, r.time
            LIMIT 20
            `;
        }

        const result = await executeQuery<any[]>(query, params);

        return NextResponse.json({
            success: true,
            reservations: result
        });
    } catch (error: any) {
        console.error('Error fetching reservations:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
}

// POST endpoint to create a new reservation
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            customerName,
            customerEmail,
            customerPhone,
            partySize,
            date,
            time,
            specialRequests,
            tableId
        } = body;

        // Validate required fields
        if (!customerName || !customerPhone || !date || !time || !partySize) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Find available tables that can accommodate the party size
        // Skip this step if a specific tableId was provided
        let finalTableId = tableId;
        let status = 'confirmed';
        let qrCodeUrl = null;
        let tableNumber = null;
        let seats = null;

        if (!finalTableId) {
            const availableTablesResult = await executeQuery<any[]>(
                `SELECT id, table_number, seats, qr_code_url
                FROM tables 
                WHERE seats >= $1 
                AND status = 'available'
                AND id NOT IN (
                    SELECT table_id FROM reservations 
                    WHERE date = $2 AND time = $3 AND status = 'confirmed'
                )
                ORDER BY seats ASC
                LIMIT 1`,
                [partySize, date, time]
            );

            if (availableTablesResult.length > 0) {
                // Found an available table
                finalTableId = availableTablesResult[0].id;
                qrCodeUrl = availableTablesResult[0].qr_code_url;
                tableNumber = availableTablesResult[0].table_number;
                seats = availableTablesResult[0].seats;
                status = 'confirmed';

                // Update table status to reserved
                await pool.query(
                    `UPDATE tables SET status = 'reserved' WHERE id = $1`,
                    [finalTableId]
                );
            } else {
                // No tables available
                finalTableId = null;
                status = 'waitlist';
            }
        } else {
            // If a specific table ID was provided, get its QR code
            const tableResult = await executeQuery<any[]>(
                `SELECT qr_code_url, table_number, seats FROM tables WHERE id = $1`,
                [finalTableId]
            );

            if (tableResult.length > 0) {
                qrCodeUrl = tableResult[0].qr_code_url;
                tableNumber = tableResult[0].table_number;
                seats = tableResult[0].seats;

                // Update table status to reserved
                await pool.query(
                    `UPDATE tables SET status = 'reserved' WHERE id = $1`,
                    [finalTableId]
                );
            }
        }

        // Insert reservation
        const result = await executeQuery<any[]>(
            `INSERT INTO reservations 
            (name, email, phone_number, date, time, party_size, table_id, status, special_instructions) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING *`,
            [
                customerName,
                customerEmail,
                customerPhone,
                date,
                time,
                partySize,
                finalTableId,
                status,
                specialRequests || null
            ]
        );

        const reservation = result[0];

        // Get restaurant name
        const restaurantResult = await executeQuery<any[]>(
            `SELECT name FROM restaurants LIMIT 1`
        );
        const restaurantName = restaurantResult.length > 0 ? restaurantResult[0].name : 'Snytra';

        // Send confirmation email if status is confirmed
        if (status === 'confirmed' && customerEmail) {
            try {
                await sendReservationConfirmation({
                    reservationId: reservation.id.toString(),
                    customerEmail,
                    customerName,
                    date: new Date(date),
                    time,
                    partySize,
                    specialRequests: specialRequests || undefined,
                    qrCodeUrl,
                    restaurantName,
                    tableName: tableNumber ? `Table ${tableNumber}` : undefined
                });
                console.log('Reservation confirmation email sent successfully');
            } catch (emailError) {
                console.error('Error sending reservation confirmation email:', emailError);
                // Continue with the reservation process even if email fails
            }
        }

        return NextResponse.json({
            success: true,
            reservation,
            table_qr_code: qrCodeUrl,
            message: status === 'confirmed'
                ? 'Reservation confirmed successfully!'
                : 'No tables available at this time. Added to waitlist!'
        });
    } catch (error: any) {
        console.error('Error creating reservation:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
}

// PATCH - Update a reservation
export async function PATCH(request: NextRequest) {
    try {
        const { id, status, date, time, partySize, tableId, specialInstructions } = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: 'Reservation ID is required' },
                { status: 400 }
            );
        }

        // Prepare update fields and values
        let updateFields = [];
        let params = [id];
        let paramIndex = 2;

        if (status !== undefined) {
            updateFields.push(`status = $${paramIndex++}`);
            params.push(status);
        }

        if (date !== undefined) {
            updateFields.push(`date = $${paramIndex++}`);
            params.push(date);
        }

        if (time !== undefined) {
            updateFields.push(`time = $${paramIndex++}`);
            params.push(time);
        }

        if (partySize !== undefined) {
            updateFields.push(`party_size = $${paramIndex++}`);
            params.push(partySize);
        }

        if (tableId !== undefined) {
            updateFields.push(`table_id = $${paramIndex++}`);
            params.push(tableId);
        }

        if (specialInstructions !== undefined) {
            updateFields.push(`special_instructions = $${paramIndex++}`);
            params.push(specialInstructions);
        }

        updateFields.push(`updated_at = NOW()`);

        if (updateFields.length === 0) {
            return NextResponse.json(
                { error: 'No fields to update' },
                { status: 400 }
            );
        }

        const query = `
            UPDATE reservations 
            SET ${updateFields.join(', ')} 
            WHERE id = $1
            RETURNING *
        `;

        const result = await executeQuery<any[]>(query, params);

        if (result.length === 0) {
            return NextResponse.json(
                { error: 'Reservation not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            reservation: result[0],
            message: 'Reservation updated successfully'
        });
    } catch (error) {
        console.error('Error updating reservation:', error);
        return NextResponse.json(
            { error: 'Failed to update reservation' },
            { status: 500 }
        );
    }
}

// DELETE - Cancel a reservation
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Reservation ID is required' },
                { status: 400 }
            );
        }

        // Get reservation first to check if it exists
        const checkResult = await executeQuery<any[]>(
            'SELECT * FROM reservations WHERE id = $1',
            [id]
        );

        if (checkResult.length === 0) {
            return NextResponse.json(
                { error: 'Reservation not found' },
                { status: 404 }
            );
        }

        // Update the status to 'cancelled' instead of deleting
        await pool.query(
            'UPDATE reservations SET status = $1, updated_at = NOW() WHERE id = $2',
            ['cancelled', id]
        );

        return NextResponse.json({
            success: true,
            message: 'Reservation cancelled successfully'
        });
    } catch (error) {
        console.error('Error cancelling reservation:', error);
        return NextResponse.json(
            { error: 'Failed to cancel reservation' },
            { status: 500 }
        );
    }
} 