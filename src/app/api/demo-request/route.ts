import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, getConnectionPool } from '@/lib/db';
import { z } from 'zod';
import { format } from 'date-fns';
import { sendEmail } from '@/lib/email';

// Define validation schema for demo request form submission
const demoRequestSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(1, "Phone number is required"),
    company: z.string().min(1, "Company name is required"),
    position: z.string().optional(),
    businessType: z.string().min(1, "Business type is required"),
    employeeCount: z.string().optional(),
    preferredDate: z.string().min(1, "Preferred date is required"),
    preferredTime: z.string().min(1, "Preferred time is required"),
    message: z.string().optional()
});

export async function POST(request: NextRequest) {
    try {
        // Parse the request body
        const body = await request.json();

        // Validate the request body
        const validationResult = demoRequestSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: validationResult.error.errors },
                { status: 400 }
            );
        }

        const {
            name,
            email,
            phone,
            company,
            position,
            businessType,
            employeeCount,
            preferredDate,
            preferredTime,
            message
        } = validationResult.data;

        // Begin a transaction
        const pool = getConnectionPool();
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Check if the demo_requests table exists, if not create it
            await client.query(`
                CREATE TABLE IF NOT EXISTS demo_requests (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    phone VARCHAR(50) NOT NULL,
                    company VARCHAR(255) NOT NULL,
                    position VARCHAR(255),
                    business_type VARCHAR(100) NOT NULL,
                    employee_count VARCHAR(50),
                    preferred_date DATE NOT NULL,
                    preferred_time VARCHAR(50) NOT NULL,
                    message TEXT,
                    status VARCHAR(50) DEFAULT 'pending',
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // 1. Store the demo request in the database
            const requestResult = await client.query(
                `INSERT INTO demo_requests (
                    name, email, phone, company, position, business_type, 
                    employee_count, preferred_date, preferred_time, message
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
                RETURNING id, created_at`,
                [
                    name,
                    email,
                    phone,
                    company,
                    position || null,
                    businessType,
                    employeeCount || null,
                    preferredDate,
                    preferredTime,
                    message || null
                ]
            );

            if (!requestResult.rows || requestResult.rows.length === 0) {
                throw new Error('Failed to insert demo request into database');
            }

            const requestId = requestResult.rows[0].id;
            const createdAt = requestResult.rows[0].created_at;
            const formattedDate = format(new Date(createdAt), 'MMMM dd, yyyy h:mm a');

            // 2. Get the email template
            const templateResult = await client.query(
                `SELECT * FROM message_templates WHERE name = $1 AND channel = $2`,
                ['demo_request_confirmation', 'email']
            );

            let emailContent = '';

            if (templateResult.rows.length === 0) {
                console.warn('Email template not found, using default template');
                // Use a default template if none is found in the database
                emailContent = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #d97706;">Your Demo Request Has Been Scheduled</h2>
                        <p>Hello ${name},</p>
                        <p>Thank you for your interest in our platform. We're excited to show you how our system can help your business.</p>
                        <p><strong>Your Demo Details:</strong></p>
                        <ul>
                            <li><strong>Name:</strong> ${name}</li>
                            <li><strong>Company:</strong> ${company}</li>
                            <li><strong>Business Type:</strong> ${businessType}</li>
                            <li><strong>Requested Date:</strong> ${preferredDate}</li>
                            <li><strong>Requested Time:</strong> ${preferredTime}</li>
                        </ul>
                        <p>Our team will review your preferred time and date and contact you shortly to confirm the details.</p>
                        <p>If you have any questions before your demo, please reply to this email or call us.</p>
                        <p>Best regards,<br>The Snytra Team</p>
                    </div>
                `;
            } else {
                // Replace variables in the template
                const template = templateResult[0];
                emailContent = template.template_content;
                emailContent = emailContent.replace(/\{\{name\}\}/g, name);
                emailContent = emailContent.replace(/\{\{email\}\}/g, email);
                emailContent = emailContent.replace(/\{\{company\}\}/g, company);
                emailContent = emailContent.replace(/\{\{business_type\}\}/g, businessType);
                emailContent = emailContent.replace(/\{\{preferred_date\}\}/g, preferredDate);
                emailContent = emailContent.replace(/\{\{preferred_time\}\}/g, preferredTime);
                emailContent = emailContent.replace(/\{\{submit_date\}\}/g, formattedDate);
            }

            // 3. Log the email to be sent
            await client.query(
                `INSERT INTO email_logs (recipient, subject, template_name, data) 
                VALUES ($1, $2, $3, $4)`,
                [
                    email,
                    'Your Demo Request - Snytra',
                    'demo_request_confirmation',
                    JSON.stringify({
                        request_id: requestId,
                        name,
                        email,
                        phone,
                        company,
                        position,
                        business_type: businessType,
                        employee_count: employeeCount,
                        preferred_date: preferredDate,
                        preferred_time: preferredTime,
                        message,
                        created_at: createdAt
                    })
                ]
            );

            // Commit the transaction
            await client.query('COMMIT');

            // 4. Send confirmation email
            try {
                await sendEmail({
                    to: email,
                    subject: 'Your Demo Request - Snytra',
                    html: emailContent
                });
            } catch (emailError) {
                console.error('Error sending confirmation email:', emailError);
                // We don't want to fail the whole process if just the email fails
            }

            // 5. Send notification to admin/sales team
            try {
                const adminNotificationHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #d97706;">New Demo Request</h2>
                        <p>A new demo request has been submitted with the following details:</p>
                        <ul>
                            <li><strong>Name:</strong> ${name}</li>
                            <li><strong>Email:</strong> ${email}</li>
                            <li><strong>Phone:</strong> ${phone}</li>
                            <li><strong>Company:</strong> ${company}</li>
                            <li><strong>Position:</strong> ${position || 'Not provided'}</li>
                            <li><strong>Business Type:</strong> ${businessType}</li>
                            <li><strong>Employee Count:</strong> ${employeeCount || 'Not provided'}</li>
                            <li><strong>Preferred Date:</strong> ${preferredDate}</li>
                            <li><strong>Preferred Time:</strong> ${preferredTime}</li>
                        </ul>
                        <p><strong>Additional Information:</strong></p>
                        <p>${message || 'No additional information provided.'}</p>
                        <p>Please follow up with this lead as soon as possible.</p>
                    </div>
                `;

                // Get admin/sales email from environment variable or database setting
                const salesEmail = process.env.SALES_EMAIL || 'sales@snytra.com';

                await sendEmail({
                    to: salesEmail,
                    subject: 'New Demo Request - Snytra',
                    html: adminNotificationHtml
                });
            } catch (notificationError) {
                console.error('Error sending admin notification email:', notificationError);
                // We don't want to fail the whole process if just the notification email fails
            }

            return NextResponse.json({
                success: true,
                message: 'Demo request submitted successfully',
                requestId
            });

        } catch (dbError) {
            // If there's an error, roll back the transaction
            await client.query('ROLLBACK');
            console.error('Database error:', dbError);
            return NextResponse.json(
                { error: 'Failed to process your demo request. Please try again later.' },
                { status: 500 }
            );
        } finally {
            // Always release the client back to the pool
            client.release();
        }
    } catch (error) {
        console.error('Error processing demo request:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}