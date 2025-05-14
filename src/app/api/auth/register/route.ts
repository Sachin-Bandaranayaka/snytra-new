import { NextRequest, NextResponse } from 'next/server';
import { sql } from "@/db/postgres";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Validation schema for registration
const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
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

        const { name, email, password } = validation.data;

        // Check if user already exists
        const existingUsers = await sql`
            SELECT id FROM users WHERE email = ${email.toLowerCase()} LIMIT 1
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

        // Create the user
        const result = await sql`
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
                ${'customer'}, 
                NOW(), 
                NOW()
            ) 
            RETURNING id, name, email, role
        `;

        const newUser = result[0];

        // Return success response
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
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Something went wrong while registering the user" },
            { status: 500 }
        );
    }
} 