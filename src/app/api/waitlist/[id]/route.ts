import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET endpoint to retrieve a specific waitlist entry
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const waitlistId = params.id;

        // Verify either authentication or phone number
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(request.url);
        const phone = searchParams.get('phone');

        // Build query
        let query = `SELECT * FROM waitlist WHERE id = $1`;
        const queryParams = [waitlistId];

        // If verifying with phone (public access), add phone to query
        if (!session && phone) {
            query += ` AND phone_number = $2`;
            queryParams.push(phone);
        } else if (!session) {
            // No session and no phone, unauthorized
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Execute query
        const result = await pool.query(query, queryParams);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Waitlist entry not found' }, { status: 404 });
        }

        const entry = result.rows[0];

        // Format response
        const waitlistEntry = {
            id: entry.id,
            customerName: entry.name,
            customerEmail: entry.customer_email,
            customerPhone: entry.phone_number,
            partySize: entry.party_size,
            date: entry.date,
            time: entry.time,
            specialRequests: entry.special_requests,
            status: entry.status,
            estimatedWaitTime: entry.estimated_wait_time,
            notified: entry.notified,
            createdAt: entry.created_at
        };

        return NextResponse.json({ waitlistEntry });
    } catch (error) {
        console.error('Error fetching waitlist entry:', error);
        return NextResponse.json(
            { error: 'Failed to fetch waitlist entry' },
            { status: 500 }
        );
    }
}

// PUT endpoint to update a waitlist entry
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const waitlistId = params.id;

        // Verify either staff authentication or customer verification
        const session = await getServerSession(authOptions);
        const isStaff = !!session;

        // Extract data from request
        const {
            customerName,
            customerEmail,
            customerPhone,
            partySize,
            date,
            time,
            specialRequests,
            status,
            estimatedWaitTime,
            notified,
            phone // For customer verification
        } = await request.json();

        // First check if the entry exists
        let checkQuery = `SELECT * FROM waitlist WHERE id = $1`;
        let checkParams = [waitlistId];

        // If not staff, require phone verification
        if (!isStaff) {
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
                { error: 'Waitlist entry not found or unauthorized' },
                { status: 404 }
            );
        }

        const currentEntry = checkResult.rows[0];

        // If customer, limit what can be updated
        if (!isStaff) {
            // Customers can only update basic info, not status or times
            const limitedUpdate = await pool.query(
                `UPDATE waitlist 
                 SET name = $1,
                     customer_email = $2,
                     party_size = $3,
                     special_requests = $4
                 WHERE id = $5 AND phone_number = $6
                 RETURNING *`,
                [
                    customerName || currentEntry.name,
                    customerEmail || currentEntry.customer_email,
                    partySize || currentEntry.party_size,
                    specialRequests !== undefined ? specialRequests : currentEntry.special_requests,
                    waitlistId,
                    phone
                ]
            );

            if (limitedUpdate.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Failed to update waitlist entry' },
                    { status: 400 }
                );
            }

            const updatedEntry = limitedUpdate.rows[0];

            return NextResponse.json({
                message: 'Waitlist entry updated successfully',
                waitlistEntry: {
                    id: updatedEntry.id,
                    customerName: updatedEntry.name,
                    customerEmail: updatedEntry.customer_email,
                    customerPhone: updatedEntry.phone_number,
                    partySize: updatedEntry.party_size,
                    date: updatedEntry.date,
                    time: updatedEntry.time,
                    specialRequests: updatedEntry.special_requests,
                    status: updatedEntry.status,
                    estimatedWaitTime: updatedEntry.estimated_wait_time,
                    notified: updatedEntry.notified
                }
            });
        }

        // For staff, allow full updates
        // If changing status to 'seated', add to reservations too
        if (status === 'seated' && currentEntry.status !== 'seated') {
            // Begin transaction
            await pool.query('BEGIN');

            try {
                // Update waitlist entry
                await pool.query(
                    `UPDATE waitlist 
                     SET name = $1,
                         customer_email = $2,
                         phone_number = $3,
                         party_size = $4,
                         date = $5,
                         time = $6,
                         special_requests = $7,
                         status = $8,
                         estimated_wait_time = $9,
                         notified = $10
                     WHERE id = $11`,
                    [
                        customerName || currentEntry.name,
                        customerEmail || currentEntry.customer_email,
                        customerPhone || currentEntry.phone_number,
                        partySize || currentEntry.party_size,
                        date || currentEntry.date,
                        time || currentEntry.time,
                        specialRequests !== undefined ? specialRequests : currentEntry.special_requests,
                        status,
                        estimatedWaitTime || currentEntry.estimated_wait_time,
                        notified !== undefined ? notified : currentEntry.notified,
                        waitlistId
                    ]
                );

                // Create a reservation record
                await pool.query(
                    `INSERT INTO reservations (
                         name, email, phone_number, party_size, 
                         date, time, special_instructions, status
                     )
                     VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed')`,
                    [
                        customerName || currentEntry.name,
                        customerEmail || currentEntry.customer_email,
                        customerPhone || currentEntry.phone_number,
                        partySize || currentEntry.party_size,
                        date || currentEntry.date,
                        time || currentEntry.time,
                        specialRequests !== undefined ? specialRequests : currentEntry.special_requests
                    ]
                );

                // Commit transaction
                await pool.query('COMMIT');

                // Retrieve updated entry
                const getUpdatedResult = await pool.query(
                    `SELECT * FROM waitlist WHERE id = $1`,
                    [waitlistId]
                );

                const updatedEntry = getUpdatedResult.rows[0];

                return NextResponse.json({
                    message: 'Waitlist entry updated and converted to reservation',
                    waitlistEntry: {
                        id: updatedEntry.id,
                        customerName: updatedEntry.name,
                        customerEmail: updatedEntry.customer_email,
                        customerPhone: updatedEntry.phone_number,
                        partySize: updatedEntry.party_size,
                        date: updatedEntry.date,
                        time: updatedEntry.time,
                        specialRequests: updatedEntry.special_requests,
                        status: updatedEntry.status,
                        estimatedWaitTime: updatedEntry.estimated_wait_time,
                        notified: updatedEntry.notified
                    }
                });

            } catch (error) {
                // Rollback in case of error
                await pool.query('ROLLBACK');
                throw error;
            }
        } else {
            // Regular update (not changing to seated)
            const updateResult = await pool.query(
                `UPDATE waitlist 
                 SET name = $1,
                     customer_email = $2,
                     phone_number = $3,
                     party_size = $4,
                     date = $5,
                     time = $6,
                     special_requests = $7,
                     status = $8,
                     estimated_wait_time = $9,
                     notified = $10
                 WHERE id = $11
                 RETURNING *`,
                [
                    customerName || currentEntry.name,
                    customerEmail || currentEntry.customer_email,
                    customerPhone || currentEntry.phone_number,
                    partySize || currentEntry.party_size,
                    date || currentEntry.date,
                    time || currentEntry.time,
                    specialRequests !== undefined ? specialRequests : currentEntry.special_requests,
                    status || currentEntry.status,
                    estimatedWaitTime || currentEntry.estimated_wait_time,
                    notified !== undefined ? notified : currentEntry.notified,
                    waitlistId
                ]
            );

            if (updateResult.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Failed to update waitlist entry' },
                    { status: 400 }
                );
            }

            const updatedEntry = updateResult.rows[0];

            return NextResponse.json({
                message: 'Waitlist entry updated successfully',
                waitlistEntry: {
                    id: updatedEntry.id,
                    customerName: updatedEntry.name,
                    customerEmail: updatedEntry.customer_email,
                    customerPhone: updatedEntry.phone_number,
                    partySize: updatedEntry.party_size,
                    date: updatedEntry.date,
                    time: updatedEntry.time,
                    specialRequests: updatedEntry.special_requests,
                    status: updatedEntry.status,
                    estimatedWaitTime: updatedEntry.estimated_wait_time,
                    notified: updatedEntry.notified
                }
            });
        }
    } catch (error) {
        console.error('Error updating waitlist entry:', error);
        return NextResponse.json(
            { error: 'Failed to update waitlist entry' },
            { status: 500 }
        );
    }
}

// DELETE endpoint to remove a waitlist entry
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const waitlistId = params.id;

        // Verify either staff authentication or customer verification
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(request.url);
        const phone = searchParams.get('phone');

        // Build check query
        let checkQuery = `SELECT * FROM waitlist WHERE id = $1`;
        let checkParams = [waitlistId];

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

        // Check if entry exists and user is authorized
        const checkResult = await pool.query(checkQuery, checkParams);

        if (checkResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Waitlist entry not found or unauthorized' },
                { status: 404 }
            );
        }

        // Delete the entry
        await pool.query('DELETE FROM waitlist WHERE id = $1', [waitlistId]);

        return NextResponse.json({
            message: 'Waitlist entry removed successfully'
        });
    } catch (error) {
        console.error('Error removing waitlist entry:', error);
        return NextResponse.json(
            { error: 'Failed to remove waitlist entry' },
            { status: 500 }
        );
    }
} 