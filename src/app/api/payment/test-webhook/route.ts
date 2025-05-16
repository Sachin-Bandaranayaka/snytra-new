import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { sendEmail } from '@/lib/nodemailer';

export async function POST(req: NextRequest) {
    try {
        // Get user info from request
        const { userId, planId, sessionId } = await req.json();

        if (!userId || !planId) {
            return NextResponse.json(
                { error: 'Missing required parameters (userId, planId)' },
                { status: 400 }
            );
        }

        // Get user details
        const userRows = await executeQuery<any[]>(
            'SELECT name, email FROM users WHERE id = $1',
            [userId]
        );

        if (userRows.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const user = userRows[0];

        // Simulate storing subscription info
        const actualSessionId = sessionId || `cs_test_${Date.now()}`;

        // Insert test subscription event
        await pool.query(
            `INSERT INTO subscription_events (
                user_id, 
                event_type, 
                plan_id, 
                amount, 
                status,
                session_id
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                userId,
                'subscription_created',
                planId,
                planId.includes('premium') ? 59.00 : planId.includes('enterprise') ? 99.00 : 29.00,
                'active',
                actualSessionId
            ]
        );

        // Update user's subscription plan
        await pool.query(
            'UPDATE users SET subscription_plan = $1 WHERE id = $2',
            [planId, userId]
        );

        // Send test confirmation email
        const planName = planId.includes('premium') ? 'Premium Plan' :
            planId.includes('enterprise') ? 'Enterprise Plan' : 'Basic Plan';
        const planPrice = planId.includes('premium') ? 59.00 :
            planId.includes('enterprise') ? 99.00 : 29.00;

        const result = await sendEmail({
            to: user.email,
            subject: `Your ${planName} Subscription is Active (TEST)`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #3b82f6;">Test Webhook: Subscription Confirmed</h1>
                    <p>Hello ${user.name},</p>
                    <p>This is a TEST email from your webhook. Your subscription to our ${planName} is confirmed!</p>
                    
                    <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-radius: 5px;">
                        <p><strong>Plan:</strong> ${planName}</p>
                        <p><strong>Status:</strong> Active</p>
                        <p><strong>Amount:</strong> $${planPrice.toFixed(2)}/month</p>
                        <p><strong>Session ID:</strong> ${actualSessionId}</p>
                    </div>
                    
                    <p>This is a test email to verify your webhook is working correctly.</p>
                </div>
            `
        });

        return NextResponse.json({
            success: true,
            message: 'Test webhook processed successfully',
            emailStatus: result.success ? 'Email sent' : 'Email failed',
            sessionId: actualSessionId
        });
    } catch (error: any) {
        console.error('Error in test webhook:', error);
        return NextResponse.json(
            { error: error.message || 'Test webhook failed' },
            { status: 500 }
        );
    }
} 