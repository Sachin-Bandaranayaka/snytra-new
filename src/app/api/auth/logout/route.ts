import { NextResponse } from 'next/server';

export async function POST() {
    try {
        // In this simple implementation, we just return a success response
        // The actual clearing of user data happens on the client side
        // For a more secure implementation, you would want to clear server-side session/token

        return NextResponse.json({
            success: true,
            message: 'Successfully logged out'
        });

    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Logout failed' },
            { status: 500 }
        );
    }
} 