import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// PUT /api/users/profile - Update user profile
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check if the user is authenticated
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const data = await request.json();

        // Validate the data
        const { name, phone, address, city, state, zip, country, company_name } = data;

        // Update the user profile
        const updatedUser = await db.users.update({
            where: { id: userId },
            data: {
                name,
                phone,
                address,
                city,
                state,
                zip,
                country,
                company_name,
                updated_at: new Date()
            },
        });

        // Remove sensitive information
        const { password, ...userWithoutPassword } = updatedUser;

        // Revalidate user data
        revalidatePath('/dashboard/account/profile');

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: userWithoutPassword
        }, { status: 200 });

    } catch (error) {
        console.error('Error updating user profile:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}

// GET /api/users/profile - Get the current user's profile
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check if the user is authenticated
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Get the user profile
        const user = await db.users.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Remove sensitive information
        const { password, ...userWithoutPassword } = user;

        return NextResponse.json({
            user: userWithoutPassword
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
} 