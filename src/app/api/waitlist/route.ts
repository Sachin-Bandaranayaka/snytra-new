import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET endpoint to retrieve waitlist entries
export async function GET(request: NextRequest) {
    try {
        // Check authentication for staff/admin
        const session = await getServerSession(authOptions);

        // Log authentication attempt for debugging
        console.log('Waitlist API Authentication:', {
            hasSession: !!session,
            sessionUser: session?.user,
            cookies: Object.fromEntries(
                request.cookies.getAll()
                    .filter(c => c.name.includes('auth') || c.name.includes('token'))
                    .map(c => [c.name, 'present'])
            )
        });

        if (!session || !session.user) {
            // Check for custom auth cookie as fallback
            const userCookie = request.cookies.get('user');
            if (!userCookie || !userCookie.value) {
                return NextResponse.json({
                    error: 'Unauthorized - Please log in again',
                    authDebug: 'Visit /api/auth/debug to check your auth status'
                }, { status: 401 });
            }

            // Using user cookie as fallback auth
            console.log('Using custom auth cookie as fallback');
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        // Build query
        let query = `
            SELECT * FROM waitlist
            WHERE 1=1
        `;

        const queryParams: any[] = [];

        // Add filters if provided
        if (date) {
            queryParams.push(date);
            query += ` AND date = $${queryParams.length}`;
        }

        if (status) {
            queryParams.push(status);
            query += ` AND status = $${queryParams.length}`;
        }

        if (search) {
            queryParams.push(`%${search}%`);
            query += ` AND (
                name ILIKE $${queryParams.length} OR 
                phone_number ILIKE $${queryParams.length} OR 
                customer_email ILIKE $${queryParams.length}
            )`;
        }

        // Order by date, time and then creation time
        query += ` ORDER BY date, time, created_at`;

        // Execute query
        const result = await pool.query(query, queryParams);

        // Format response
        const waitlist = result.rows.map(row => ({
            id: row.id,
            customerName: row.name,
            customerEmail: row.customer_email,
            customerPhone: row.phone_number,
            partySize: row.party_size,
            date: row.date,
            time: row.time,
            specialRequests: row.special_requests,
            status: row.status,
            estimatedWaitTime: row.estimated_wait_time,
            notified: row.notified,
            createdAt: row.created_at
        }));

        return NextResponse.json({ waitlist });
    } catch (error) {
        console.error('Error fetching waitlist:', error);
        return NextResponse.json(
            { error: 'Failed to fetch waitlist' },
            { status: 500 }
        );
    }
}

// POST endpoint to add a customer to the waitlist
export async function POST(request: NextRequest) {
    try {
        // Extract waitlist data from request
        const {
            customerName,
            customerEmail,
            customerPhone,
            partySize,
            date,
            time,
            specialRequests
        } = await request.json();

        // Validate required fields
        if (!customerName || !customerPhone || !partySize || !date || !time) {
            return NextResponse.json(
                { error: 'Name, phone, party size, date, and time are required' },
                { status: 400 }
            );
        }

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return NextResponse.json(
                { error: 'Invalid date format. Use YYYY-MM-DD' },
                { status: 400 }
            );
        }

        // Validate time format
        if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
            return NextResponse.json(
                { error: 'Invalid time format. Use HH:MM 24-hour format' },
                { status: 400 }
            );
        }

        // Check if the date and time are in the future
        const waitlistDateTime = new Date(`${date}T${time}:00`);
        const now = new Date();

        if (waitlistDateTime <= now) {
            return NextResponse.json(
                { error: 'Waitlist date and time must be in the future' },
                { status: 400 }
            );
        }

        // Get day of week for the reservation date
        const dayOfWeek = waitlistDateTime.getDay();

        // Check if reservations are allowed for this day
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

        // Check if the time is within restaurant hours
        const settings = settingsResult.rows[0];
        const openTime = new Date(`${date}T${settings.open_time}`);
        const closeTime = new Date(`${date}T${settings.close_time}`);

        if (waitlistDateTime < openTime || waitlistDateTime >= closeTime) {
            return NextResponse.json(
                { error: 'Waitlist time is outside of business hours' },
                { status: 400 }
            );
        }

        // Check if there are already people on the waitlist for this time slot
        const waitlistCountResult = await pool.query(
            `SELECT COUNT(*) as count 
             FROM waitlist 
             WHERE date = $1 AND time = $2 AND status = 'waiting'`,
            [date, time]
        );

        const waitlistCount = parseInt(waitlistCountResult.rows[0].count);

        // Calculate estimated wait time (15 minutes per 2 parties ahead)
        const estimatedWaitTime = Math.ceil(waitlistCount / 2) * 15;

        // Insert into waitlist
        const result = await pool.query(
            `INSERT INTO waitlist
             (name, customer_email, phone_number, party_size, date, time, special_requests, status, estimated_wait_time)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'waiting', $8)
             RETURNING *`,
            [customerName, customerEmail, customerPhone, partySize, date, time, specialRequests, estimatedWaitTime]
        );

        const newWaitlistEntry = result.rows[0];

        return NextResponse.json({
            message: 'Added to waitlist successfully',
            waitlistEntry: {
                id: newWaitlistEntry.id,
                customerName: newWaitlistEntry.name,
                customerEmail: newWaitlistEntry.customer_email,
                customerPhone: newWaitlistEntry.phone_number,
                partySize: newWaitlistEntry.party_size,
                date: newWaitlistEntry.date,
                time: newWaitlistEntry.time,
                specialRequests: newWaitlistEntry.special_requests,
                status: newWaitlistEntry.status,
                estimatedWaitTime: newWaitlistEntry.estimated_wait_time,
                createdAt: newWaitlistEntry.created_at
            },
            position: waitlistCount + 1,
            estimatedWaitTime
        }, { status: 201 });
    } catch (error) {
        console.error('Error adding to waitlist:', error);
        return NextResponse.json(
            { error: 'Failed to add to waitlist' },
            { status: 500 }
        );
    }
}

// PATCH - Update waitlist status
export async function PATCH(request: NextRequest) {
    try {
        const { id, status } = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: 'Waitlist ID is required' },
                { status: 400 }
            );
        }

        if (!status) {
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400 }
            );
        }

        // Update status
        const result = await pool.query(
            `UPDATE waitlist SET status = $1 WHERE id = $2 RETURNING *`,
            [status, id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { error: 'Waitlist entry not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            waitlist: result.rows[0],
            message: 'Waitlist status updated successfully'
        });
    } catch (error) {
        console.error('Error updating waitlist:', error);
        return NextResponse.json(
            { error: 'Failed to update waitlist' },
            { status: 500 }
        );
    }
}

// DELETE - Remove from waitlist
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Waitlist ID is required' },
                { status: 400 }
            );
        }

        // Delete from waitlist
        const result = await pool.query(
            `DELETE FROM waitlist WHERE id = $1 RETURNING id`,
            [id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { error: 'Waitlist entry not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Removed from waitlist successfully'
        });
    } catch (error) {
        console.error('Error removing from waitlist:', error);
        return NextResponse.json(
            { error: 'Failed to remove from waitlist' },
            { status: 500 }
        );
    }
} 