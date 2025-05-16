import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { z } from 'zod';
import { format } from 'date-fns';
import { sendEmail } from '@/lib/email';

// Define validation schema for contact form submission
const contactFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().optional(),
    message: z.string().min(5, "Message must be at least 5 characters")
});

export async function POST(request: NextRequest) {
    try {
        // Parse the request body
        const body = await request.json();

        // Validate the request body
        const validationResult = contactFormSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: validationResult.error.errors },
                { status: 400 }
            );
        }

        const { name, email, phone, message } = validationResult.data;

        // Begin a transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Store the submission in the database
            const submissionResult = await client.query(
                `INSERT INTO contact_submissions (name, email, phone, message) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, created_at`,
                [name, email, phone || null, message]
            );

            const submissionId = submissionResult[0].id;
            const createdAt = submissionResult[0].created_at;
            const formattedDate = format(new Date(createdAt), 'MMMM dd, yyyy h:mm a');

            // 2. Get the email template
            const templateResult = await client.query(
                `SELECT * FROM message_templates WHERE name = $1 AND channel = $2`,
                ['contact_form_confirmation', 'email']
            );

            let emailContent = '';

            if (templateResult.length === 0) {
                console.warn('Email template not found, using default template');
                // Use a default template if none is found in the database
                emailContent = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #d97706;">Thank You for Contacting Us</h2>
                        <p>Hello ${name},</p>
                        <p>We've received your message and will get back to you soon.</p>
                        <p><strong>Your Details:</strong></p>
                        <ul>
                            <li><strong>Name:</strong> ${name}</li>
                            <li><strong>Email:</strong> ${email}</li>
                            <li><strong>Phone:</strong> ${phone || 'Not provided'}</li>
                            <li><strong>Submitted On:</strong> ${formattedDate}</li>
                        </ul>
                        <p><strong>Your Message:</strong></p>
                        <p style="background-color: #f9f9f9; padding: 10px; border-left: 4px solid #d97706;">${message}</p>
                        <p>We appreciate your interest and will respond as soon as possible.</p>
                        <p>Best regards,<br>The Snytra Team</p>
                    </div>
                `;
            } else {
                // Replace variables in the template
                const template = templateResult[0];
                emailContent = template.template_content;
                emailContent = emailContent.replace(/\{\{name\}\}/g, name);
                emailContent = emailContent.replace(/\{\{email\}\}/g, email);
                emailContent = emailContent.replace(/\{\{phone\}\}/g, phone || 'Not provided');
                emailContent = emailContent.replace(/\{\{message\}\}/g, message);
                emailContent = emailContent.replace(/\{\{submit_date\}\}/g, formattedDate);
            }

            // 3. Log the email to be sent
            await client.query(
                `INSERT INTO email_logs (recipient, subject, template_name, data) 
         VALUES ($1, $2, $3, $4)`,
                [
                    email,
                    'Thank you for contacting Snytra',
                    'contact_form_confirmation',
                    JSON.stringify({
                        submission_id: submissionId,
                        name,
                        email,
                        phone,
                        message,
                        created_at: createdAt
                    })
                ]
            );

            // Commit the transaction
            await client.query('COMMIT');

            // 4. Actually send the email
            try {
                const emailResult = await sendEmail({
                    to: email,
                    subject: 'Thank you for contacting Snytra',
                    html: emailContent,
                    text: `Thank you for contacting us, ${name}. We've received your message and will get back to you soon. 
                    Your message: ${message}
                    Submitted on: ${formattedDate}`
                });

                console.log('Email sent successfully:', emailResult);
            } catch (emailError) {
                console.error('Failed to send email:', emailError);
                // We continue even if the email fails - the submission is already saved
            }

            return NextResponse.json({
                success: true,
                message: 'Contact form submission received successfully',
                submission_id: submissionId
            });

        } catch (dbError) {
            // Rollback the transaction in case of error
            await client.query('ROLLBACK');
            throw dbError;
        } finally {
            // Release the client back to the pool
            client.release();
        }

    } catch (error) {
        console.error('Error processing contact form submission:', error);

        return NextResponse.json(
            {
                error: 'Failed to process your submission',
                details: process.env.NODE_ENV === 'development' ? String(error) : undefined
            },
            { status: 500 }
        );
    }
} 