import { NextRequest, NextResponse } from 'next/server';
import { sql } from "@/db/postgres";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Validation schema for registration
const registerSchema = z.object({
    companyInfo: z.object({
        name: z.string().min(2, "Company name must be at least 2 characters"),
        industry: z.string().min(1, "Industry is required"),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().optional(),
        businessSize: z.string().optional(),
        numLocations: z.number().int().positive().optional()
    }),
    contactDetails: z.object({
        name: z.string().min(2, "Contact name must be at least 2 characters"),
        jobTitle: z.string().optional(),
        email: z.string().email("Invalid email address"),
        phone: z.string().optional()
    }),
    accountCredentials: z.object({
        username: z.string().min(3, "Username must be at least 3 characters"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        enableTwoFactor: z.boolean().optional(),
        securityQuestion: z.string().optional(),
        securityAnswer: z.string().optional()
    }),
    legalCompliance: z.object({
        acceptTerms: z.boolean().refine(val => val === true, {
            message: "You must accept the terms and conditions"
        }),
        acceptPrivacyPolicy: z.boolean().refine(val => val === true, {
            message: "You must accept the privacy policy"
        }),
        taxId: z.string().optional(),
        businessRegistration: z.string().optional()
    })
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate the request body
        const validation = registerSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { message: "Validation failed", errors: validation.error.errors },
                { status: 400 }
            );
        }

        const {
            companyInfo,
            contactDetails,
            accountCredentials,
            legalCompliance
        } = validation.data;

        // Check if user already exists
        const existingUsers = await sql`
            SELECT id FROM users 
            WHERE email = ${contactDetails.email.toLowerCase()} 
            OR username = ${accountCredentials.username}
            LIMIT 1
        `;

        if (existingUsers.length > 0) {
            return NextResponse.json(
                { message: "User with this email or username already exists" },
                { status: 409 }
            );
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(accountCredentials.password, salt);

        // Begin transaction
        const result = await sql.begin(async (sql) => {
            // Create the user
            const userResult = await sql`
                INSERT INTO users (
                    name, 
                    email, 
                    username,
                    password_hash, 
                    role, 
                    job_title,
                    phone,
                    two_factor_enabled,
                    security_question,
                    security_answer,
                    accepted_terms,
                    accepted_privacy,
                    created_at, 
                    updated_at
                )
                VALUES (
                    ${contactDetails.name}, 
                    ${contactDetails.email.toLowerCase()}, 
                    ${accountCredentials.username},
                    ${hashedPassword}, 
                    ${'customer'}, 
                    ${contactDetails.jobTitle || null},
                    ${contactDetails.phone || null},
                    ${accountCredentials.enableTwoFactor || false},
                    ${accountCredentials.securityQuestion || null},
                    ${accountCredentials.securityAnswer || null},
                    ${legalCompliance.acceptTerms},
                    ${legalCompliance.acceptPrivacyPolicy},
                    NOW(), 
                    NOW()
                ) 
                RETURNING id, name, email, role
            `;

            const newUser = userResult[0];

            // Create company info
            await sql`
                INSERT INTO company_info (
                    user_id,
                    company_name,
                    industry,
                    address,
                    city,
                    state,
                    zip_code,
                    country,
                    business_size,
                    num_locations,
                    tax_id,
                    business_registration,
                    created_at,
                    updated_at
                )
                VALUES (
                    ${newUser.id},
                    ${companyInfo.name},
                    ${companyInfo.industry},
                    ${companyInfo.address || null},
                    ${companyInfo.city || null},
                    ${companyInfo.state || null},
                    ${companyInfo.zipCode || null},
                    ${companyInfo.country || null},
                    ${companyInfo.businessSize || null},
                    ${companyInfo.numLocations || 1},
                    ${legalCompliance.taxId || null},
                    ${legalCompliance.businessRegistration || null},
                    NOW(),
                    NOW()
                )
            `;

            return newUser;
        });

        // Return success response
        return NextResponse.json(
            {
                message: "User registered successfully",
                user: {
                    id: result.id,
                    name: result.name,
                    email: result.email,
                    role: result.role,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Something went wrong while registering the user" },
            { status: 500 }
        );
    }
} 