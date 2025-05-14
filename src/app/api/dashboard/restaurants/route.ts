import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        // In a real application, we would get the user ID from a session or token
        // For now, we'll just fetch all restaurants
        const { rows } = await pool.query(`
      SELECT id, name, description, address 
      FROM restaurants 
      ORDER BY name ASC
    `);

        return NextResponse.json({
            restaurants: rows,
            success: true
        });
    } catch (error: any) {
        console.error('Error fetching restaurants:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
} 