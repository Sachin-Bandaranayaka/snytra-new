'use server';

import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createReservation(formData: FormData) {
    try {
        const name = formData.get('name') as string;
        const email = formData.get('email') as string || null;
        const phoneNumber = formData.get('phoneNumber') as string;
        const date = formData.get('date') as string;
        const time = formData.get('time') as string;
        const partySize = parseInt(formData.get('partySize') as string);
        const specialInstructions = formData.get('specialInstructions') as string || null;

        // Validate required fields
        if (!name || !phoneNumber || !date || !time || !partySize) {
            return {
                success: false,
                message: 'Missing required fields'
            };
        }

        // Find available tables that can accommodate the party size
        const availableTablesResult = await pool.query(
            `SELECT id, table_number, seats 
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

        let tableId = null;
        let status = 'waitlist'; // Default to waitlist

        if (availableTablesResult.rowCount > 0) {
            // Found an available table
            tableId = availableTablesResult.rows[0].id;
            status = 'confirmed';
        }

        // Insert reservation
        const result = await pool.query(
            `INSERT INTO reservations 
       (name, email, phone_number, date, time, party_size, table_id, status, special_instructions) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
            [
                name,
                email,
                phoneNumber,
                date,
                time,
                partySize,
                tableId,
                status,
                specialInstructions
            ]
        );

        const reservation = result.rows[0];

        revalidatePath('/reservations');

        return {
            success: true,
            reservation,
            message: status === 'confirmed'
                ? 'Reservation confirmed successfully!'
                : 'No tables available at this time. Added to waitlist!'
        };
    } catch (error) {
        console.error('Error creating reservation:', error);
        return {
            success: false,
            message: 'Failed to create reservation. Please try again.'
        };
    }
}

export async function addToWaitlist(formData: FormData) {
    try {
        console.log('Adding to waitlist - received data:', Object.fromEntries(formData));

        const name = formData.get('name') as string;
        const phoneNumber = formData.get('phoneNumber') as string;
        const partySize = parseInt(formData.get('partySize') as string);

        // Validate required fields
        if (!name || !phoneNumber || !partySize) {
            console.log('Validation failed - missing fields:', { name, phoneNumber, partySize });
            return {
                success: false,
                message: 'Missing required fields'
            };
        }

        console.log('Attempting to insert into waitlist table:', { name, phoneNumber, partySize });

        // Insert into waitlist
        const result = await pool.query(
            `INSERT INTO waitlist (name, phone_number, party_size) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
            [name, phoneNumber, partySize]
        );

        console.log('Insert successful, waitlist entry created:', result.rows[0]);

        const waitlistEntry = result.rows[0];

        revalidatePath('/reservations');

        return {
            success: true,
            waitlist: waitlistEntry,
            message: 'Added to waitlist successfully!'
        };
    } catch (error) {
        console.error('Detailed error adding to waitlist:', error);

        // Log the error with more details
        if (error instanceof Error) {
            console.error('Error type:', error.constructor.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }

        return {
            success: false,
            message: 'Failed to add to waitlist. Please try again.'
        };
    }
}

export async function getUpcomingReservations(email?: string, phone?: string) {
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
            return { success: false, reservations: [] };
        }

        const result = await pool.query(query, params);

        return {
            success: true,
            reservations: result.rows
        };
    } catch (error) {
        console.error('Error fetching reservations:', error);
        return {
            success: false,
            reservations: [],
            message: 'Failed to fetch reservations'
        };
    }
} 