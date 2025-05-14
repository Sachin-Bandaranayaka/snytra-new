import { NextRequest, NextResponse } from 'next/server';
import seedDatabase from '@/lib/seed-data';

export async function POST(req: NextRequest) {
    try {
        await seedDatabase();

        return NextResponse.json({
            success: true,
            message: 'Database seeded successfully'
        });
    } catch (error: any) {
        console.error('Database seed failed:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                message: 'Database seed failed'
            },
            { status: 500 }
        );
    }
} 