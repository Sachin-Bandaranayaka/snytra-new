import { NextRequest, NextResponse } from 'next/server';
import { sql } from "@/db/postgres";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Simple registration schema (for CustomSignUp)
const simpleRegisterSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters")
});

// Complex registration schema (for RegisterForm)
const complexRegisterSchema = z.object({
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

// Helper function to determine registration type
function isSimpleRegistration(body: any): boolean {
    return 'name' in body && 'email' in body && 'password' in body && !('companyInfo' in body);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        // Determine registration type and validate accordingly
        const isSimple = isSimpleRegistration(body);
        
        if (isSimple) {
            // Handle simple registration (CustomSignUp)
            const validation = simpleRegisterSchema.safeParse(body);
            if (!validation.success) {
                return NextResponse.json(
                    { message: "Validation failed", errors: validation.error.errors },
                    { status: 400 }
                );
            }
            
            return await handleSimpleRegistration(validation.data);
        } else {
            // Handle complex registration (RegisterForm)
            const validation = complexRegisterSchema.safeParse(body);
            if (!validation.success) {
                return NextResponse.json(
                    { message: "Validation failed", errors: validation.error.errors },
                    { status: 400 }
                );
            }
            
            return await handleComplexRegistration(validation.data);
        }
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Something went wrong while registering the user" },
            { status: 500 }
        );
    }
}

// Handle simple registration flow
async function handleSimpleRegistration(data: z.infer<typeof simpleRegisterSchema>) {
    const { name, email, password } = data;
    
    // Check if user already exists
    const existingUsers = await sql`
        SELECT id FROM users 
        WHERE email = ${email.toLowerCase()}
        LIMIT 1
    `;

    if (existingUsers.length > 0) {
        return NextResponse.json(
            { message: "User with this email already exists" },
            { status: 409 }
        );
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user (simple registration - no company info)
    const userResult = await sql`
        INSERT INTO users (
            name, 
            email, 
            password_hash, 
            role,
            created_at, 
            updated_at
        )
        VALUES (
            ${name}, 
            ${email.toLowerCase()}, 
            ${hashedPassword}, 
            ${'user'},
            NOW(), 
            NOW()
        ) 
        RETURNING id, name, email, role
    `;

    const newUser = userResult[0];

    return NextResponse.json(
        {
            message: "User registered successfully",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        },
        { status: 201 }
    );
}

// Handle complex registration flow
async function handleComplexRegistration(data: z.infer<typeof complexRegisterSchema>) {
    const {
        companyInfo,
        contactDetails,
        accountCredentials,
        legalCompliance
    } = data;

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
        // Create the user (only with fields that exist in the users table)
        const userResult = await sql`
            INSERT INTO users (
                name, 
                email, 
                username,
                password_hash, 
                role, 
                phone,
                created_at, 
                updated_at
            )
            VALUES (
                ${contactDetails.name}, 
                ${contactDetails.email.toLowerCase()}, 
                ${accountCredentials.username},
                ${hashedPassword}, 
                ${'user'}, 
                ${contactDetails.phone || null},
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
}