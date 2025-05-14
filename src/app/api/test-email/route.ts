import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
    try {
        // This will only work in development mode for testing
        if (process.env.NODE_ENV !== 'development') {
            return NextResponse.json({
                error: 'Test endpoint only available in development mode'
            }, { status: 403 });
        }

        // Get test email address from query parameter, or use default
        const url = new URL(request.url);
        const testEmail = url.searchParams.get('email') || 'test@example.com';

        // Send a test email
        const result = await sendEmail({
            to: testEmail,
            subject: 'Test Email from Snytra Restaurant',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #d97706;">Test Email</h2>
          <p>This is a test email from your Snytra Restaurant application.</p>
          <p>If you're seeing this, email sending is working correctly!</p>
          <p>Sent at: ${new Date().toLocaleString()}</p>
        </div>
      `,
            text: `Test Email from Snytra Restaurant
      
This is a test email from your Snytra Restaurant application.
If you're seeing this, email sending is working correctly!

Sent at: ${new Date().toLocaleString()}`
        });

        return NextResponse.json({
            message: 'Test email sent successfully!',
            result,
            note: 'In development mode, check your console logs for the preview URL'
        });
    } catch (error) {
        console.error('Error sending test email:', error);
        return NextResponse.json({
            error: 'Failed to send test email',
            details: String(error)
        }, { status: 500 });
    }
} 