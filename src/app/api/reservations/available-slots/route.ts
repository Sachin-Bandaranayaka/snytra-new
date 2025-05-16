import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const date = url.searchParams.get('date');
        const partySize = url.searchParams.get('partySize');

        if (!date) {
            return NextResponse.json(
                { error: 'Date parameter is required' },
                { status: 400 }
            );
        }

        // Get restaurant open hours (this would typically come from settings)
        // For this example, we'll use static hours from 6 PM to 10 PM
        const openTime = "18:00";
        const closeTime = "22:00";

        // Generate available time slots in 30-minute intervals
        const slots = [];
        let currentTime = openTime;

        while (currentTime < closeTime) {
            // Format as HH:MM
            const hour = parseInt(currentTime.split(':')[0]);
            const minute = parseInt(currentTime.split(':')[1]);

            // Add slot
            slots.push({
                time: currentTime,
                display: `${hour > 12 ? hour - 12 : hour}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`,
                available: 3 // Default 3 tables per time slot
            });

            // Increment by 30 minutes
            if (minute === 30) {
                currentTime = `${hour + 1}:00`;
            } else {
                currentTime = `${hour}:30`;
            }
        }

        // Get existing reservations for this date to determine availability
        const reservationsResult = await executeQuery<any[]>(
            `SELECT time, COUNT(*) as count 
             FROM reservations 
             WHERE date = $1 AND status = 'confirmed'
             GROUP BY time`,
            [date]
        );

        // Calculate availability based on existing reservations
        for (const reservation of reservationsResult) {
            const slot = slots.find(s => s.time === reservation.time);
            if (slot) {
                slot.available = Math.max(0, slot.available - parseInt(reservation.count));
            }
        }

        // If party size is specified, filter slots with enough availability
        let availableSlots = slots;
        if (partySize) {
            const size = parseInt(partySize);
            // For simplicity, we'll assume larger parties need more tables
            const tablesNeeded = Math.ceil(size / 4); // Assume 4 people per table
            availableSlots = slots.filter(slot => slot.available >= tablesNeeded);
        }

        return NextResponse.json({
            date,
            availableSlots,
            success: true
        });
    } catch (error: any) {
        console.error('Error getting available slots:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
} 