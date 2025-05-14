import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, sendOrderConfirmation, sendRegistrationConfirmation, sendReservationConfirmation, sendPasswordResetEmail } from '@/lib/nodemailer';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { type, data } = body;

        if (!type || !data) {
            return NextResponse.json(
                { error: 'Missing required fields (type, data)' },
                { status: 400 }
            );
        }

        let result;

        // Handle different email types
        switch (type) {
            case 'test':
                result = await sendEmail({
                    to: data.to || 'test@example.com',
                    subject: data.subject || 'Test Email',
                    html: data.html || '<p>This is a test email.</p>'
                });
                break;

            case 'order_confirmation':
                if (!data.orderNumber || !data.customerEmail) {
                    return NextResponse.json(
                        { error: 'Missing required order data' },
                        { status: 400 }
                    );
                }

                result = await sendOrderConfirmation({
                    orderNumber: data.orderNumber,
                    customerEmail: data.customerEmail,
                    customerName: data.customerName || 'Valued Customer',
                    items: data.items || [],
                    total: data.total || 0,
                    orderDate: data.orderDate ? new Date(data.orderDate) : new Date()
                });
                break;

            case 'registration':
            case 'welcome':
                if (!data.email || !data.name) {
                    return NextResponse.json(
                        { error: 'Missing required user data (email, name)' },
                        { status: 400 }
                    );
                }

                result = await sendRegistrationConfirmation({
                    email: data.email,
                    name: data.name,
                    verificationLink: data.verificationLink
                });
                break;

            case 'reservation':
                if (!data.customerEmail || !data.customerName || !data.date || !data.time) {
                    return NextResponse.json(
                        { error: 'Missing required reservation data' },
                        { status: 400 }
                    );
                }

                result = await sendReservationConfirmation({
                    reservationId: data.reservationId || `RES-${Date.now().toString().slice(-6)}`,
                    customerEmail: data.customerEmail,
                    customerName: data.customerName,
                    date: new Date(data.date),
                    time: data.time,
                    partySize: data.partySize || 1,
                    specialRequests: data.specialRequests
                });
                break;

            case 'password_reset':
                if (!data.email || !data.name || !data.resetToken) {
                    return NextResponse.json(
                        { error: 'Missing required password reset data' },
                        { status: 400 }
                    );
                }

                result = await sendPasswordResetEmail({
                    email: data.email,
                    name: data.name,
                    resetToken: data.resetToken,
                    expiryTime: data.expiryTime
                });
                break;

            default:
                return NextResponse.json(
                    { error: `Unknown email type: ${type}` },
                    { status: 400 }
                );
        }

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result.data
        });
    } catch (error: any) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}