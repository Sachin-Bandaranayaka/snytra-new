import { NextRequest, NextResponse } from 'next/server';
import { db, executeQuery, getConnectionPool } from '@/lib/db';
import { hash } from 'bcrypt';

export async function POST(req: NextRequest) {
    try {
        const {
            companyInfo,
            contactDetails,
            accountCredentials
        } = await req.json();

        // Validate required inputs
        if (!companyInfo.name || !contactDetails.contactEmail || !accountCredentials.password) {
            return NextResponse.json(
                { error: 'Company name, contact email, and password are required' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUsers = await executeQuery(
            'SELECT id FROM users WHERE email = $1',
            [contactDetails.contactEmail]
        );

        if (existingUsers.length > 0) {
            return NextResponse.json(
                { error: 'Email already in use' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await hash(accountCredentials.password, 10);

        // Insert user into database
        const userData = await executeQuery(
            `INSERT INTO users (
                name, 
                email, 
                username,
                password_hash,
                phone,
                role
            ) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING id, name, email`,
            [
                contactDetails.contactName,
                contactDetails.contactEmail,
                accountCredentials.username,
                passwordHash,
                contactDetails.phoneNumber,
                contactDetails.jobTitle
            ]
        );

        const newUser = userData[0];

        // Create restaurant entry
        await executeQuery(
            `INSERT INTO restaurants (
                user_id, 
                name, 
                industry,
                business_size,
                num_locations
            ) 
            VALUES ($1, $2, $3, $4, $5)`,
            [
                newUser.id,
                companyInfo.name,
                companyInfo.industry,
                companyInfo.businessSize,
                companyInfo.numLocations
            ]
        );

        // Send welcome email
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'registration',
                    data: {
                        email: contactDetails.contactEmail,
                        name: contactDetails.contactName
                    }
                }),
            });

            if (!response.ok) {
                console.error('Failed to send welcome email');
            }
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            // Continue with registration even if email fails
        }

        // Return success response with user data (excluding password)
        return NextResponse.json(
            {
                message: 'User registered successfully',
                user: newUser
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Failed to register user' },
            { status: 500 }
        );
    }
} 