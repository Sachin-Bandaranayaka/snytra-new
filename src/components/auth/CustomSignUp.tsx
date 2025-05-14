"use client";

import {
    SignUp as StackSignUp,
    OAuthButtonGroup,
    CredentialSignUp,
    SubmitButton
} from "@stackframe/stack";
import Link from "next/link";
import { useState } from "react";

export default function CustomSignUp() {
    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto p-8 bg-white rounded-lg shadow-md">
            <div className="mb-6 w-full">
                <h1 className="text-2xl font-bold text-center text-charcoal mb-2">Create an account</h1>
                <p className="text-darkGray text-center mb-6">Join us to get started with your restaurant experience</p>

                {/* OAuth buttons */}
                <div className="mb-6">
                    <OAuthButtonGroup />
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-lightGray"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-darkGray">Or sign up with email</span>
                    </div>
                </div>

                {/* Sign up form */}
                <div className="space-y-4">
                    <CredentialSignUp className="space-y-4" />
                </div>

                <div className="mt-6 text-center">
                    <p className="text-darkGray">
                        Already have an account?{" "}
                        <Link href="/handler/signin" className="text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
} 