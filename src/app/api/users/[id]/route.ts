import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const query = `
            SELECT id, name, email, role, created_at, updated_at, 
            subscription_plan, subscription_status, 
            subscription_current_period_start, subscription_current_period_end
            FROM users 
            WHERE id = $1
        `;

        const result = await executeQuery<any[]>(query, [id]);

        if (result.length === 0) {
            return NextResponse.json(
                { error: 'User not found', success: false },
                { status: 404 }
            );
        }

        return NextResponse.json({
            user: result[0],
            success: true
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user', success: false },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const data = await request.json();
        const { name, email, role, password } = data;

        // Check if user exists
        const checkQuery = 'SELECT id FROM users WHERE id = $1';
        const checkResult = await executeQuery<any[]>(checkQuery, [id]);

        if (checkResult.length === 0) {
            return NextResponse.json(
                { error: 'User not found', success: false },
                { status: 404 }
            );
        }

        // If email is being changed, check if it's already taken
        if (email) {
            const checkEmailQuery = 'SELECT id FROM users WHERE email = $1 AND id != $2';
            const emailCheck = await executeQuery<any[]>(checkEmailQuery, [email, id]);

            if (emailCheck.length > 0) {
                return NextResponse.json(
                    { error: 'This email is already in use by another account', success: false },
                    { status: 400 }
                );
            }
        }

        // Build update query
        let updateQuery = 'UPDATE users SET ';
        let updateValues = [];
        let valueIndex = 1;

        if (name) {
            updateQuery += `name = $${valueIndex}, `;
            updateValues.push(name);
            valueIndex++;
        }

        if (email) {
            updateQuery += `email = $${valueIndex}, `;
            updateValues.push(email);
            valueIndex++;
        }

        if (role) {
            updateQuery += `role = $${valueIndex}, `;
            updateValues.push(role);
            valueIndex++;
        }

        if (password) {
            const saltRounds = 10;
            const password_hash = await bcrypt.hash(password, saltRounds);
            updateQuery += `password_hash = $${valueIndex}, `;
            updateValues.push(password_hash);
            valueIndex++;
        }

        // Add updated_at timestamp
        updateQuery += `updated_at = NOW() `;

        // Add WHERE clause and finalize query
        updateQuery += `WHERE id = $${valueIndex} RETURNING id, name, email, role, created_at, updated_at`;
        updateValues.push(id);

        const result = await executeQuery<any[]>(updateQuery, updateValues);

        return NextResponse.json({
            user: result[0],
            success: true
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Failed to update user', success: false },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Check if user exists
        const checkQuery = 'SELECT id FROM users WHERE id = $1';
        const checkResult = await executeQuery<any[]>(checkQuery, [id]);

        if (checkResult.length === 0) {
            return NextResponse.json(
                { error: 'User not found', success: false },
                { status: 404 }
            );
        }

        // Delete the user
        const deleteQuery = 'DELETE FROM users WHERE id = $1 RETURNING id';
        await pool.query(deleteQuery, [id]);

        return NextResponse.json({
            message: 'User deleted successfully',
            success: true
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Failed to delete user', success: false },
            { status: 500 }
        );
    }
} 