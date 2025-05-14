import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { sendPasswordResetEmail } from '@/lib/nodemailer';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = await prisma.$queryRaw`
            SELECT id, name, email 
            FROM users 
            WHERE email = ${email}
        `;

        if (!user || !Array.isArray(user) || user.length === 0) {
            // We still return success for security reasons
            // This prevents email enumeration attacks
            return NextResponse.json({
                success: true,
                message: 'If your email exists in our system, you will receive a password reset link'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token valid for 1 hour

        // Save token to database
        await prisma.$executeRaw`
            UPDATE users 
            SET reset_token = ${resetToken}, reset_token_expires = ${tokenExpiry}
            WHERE email = ${email}
        `;

        // Send password reset email using the shared email utility
        // This uses the Gmail configuration that's already working
        await sendPasswordResetEmail({
            email: email,
            name: user[0].name,
            resetToken: resetToken,
            expiryTime: 60 // 60 minutes
        });

        return NextResponse.json({
            success: true,
            message: 'If your email exists in our system, you will receive a password reset link'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 