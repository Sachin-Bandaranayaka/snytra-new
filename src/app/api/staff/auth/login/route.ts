import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password are required" },
                { status: 400 }
            );
        }

        // Find staff member by email
        const staff = await prisma.staffMember.findUnique({
            where: { email },
        });

        if (!staff) {
            return NextResponse.json(
                { message: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Check if staff is active
        if (!staff.isActive) {
            return NextResponse.json(
                { message: "Your account is inactive. Please contact management." },
                { status: 403 }
            );
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, staff.password);
        if (!passwordMatch) {
            return NextResponse.json(
                { message: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Create JWT token
        const token = jwt.sign(
            {
                id: staff.id,
                email: staff.email,
                role: staff.role,
                name: staff.name,
            },
            process.env.JWT_SECRET || "secret-key",
            { expiresIn: "12h" }
        );

        // Set JWT as HTTP-only cookie
        (await cookies()).set({
            name: "staff_token",
            value: token,
            httpOnly: true,
            path: "/",
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 12, // 12 hours
        });

        // Return user information (excluding password)
        const { password: _, ...userWithoutPassword } = staff;

        return NextResponse.json({
            message: "Login successful",
            user: userWithoutPassword,
            token,
        });
    } catch (error) {
        console.error("Staff login error:", error);
        return NextResponse.json(
            { message: "An error occurred during login" },
            { status: 500 }
        );
    }
} 