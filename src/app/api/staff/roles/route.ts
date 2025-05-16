import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
    try {
        const result = await executeQuery<any[]>(`
      SELECT * FROM staff_roles
      ORDER BY id
    `);

        return NextResponse.json({
            success: true,
            roles: result
        });
    } catch (error: any) {
        console.error('Error fetching staff roles:', error);

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch staff roles' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, permissions } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, error: 'Role name is required' },
                { status: 400 }
            );
        }

        const result = await executeQuery<any[]>(
            `INSERT INTO staff_roles (name, description, permissions)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [name, description || null, permissions || {}]
        );

        return NextResponse.json({
            success: true,
            role: result[0]
        });
    } catch (error: any) {
        console.error('Error creating staff role:', error);

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create staff role' },
            { status: 500 }
        );
    }
} 