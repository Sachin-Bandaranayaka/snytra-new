"use client";

import {
    SignIn as StackSignIn,
    OAuthButtonGroup,
    CredentialSignIn,
    MagicLinkSignIn,
    SubmitButton
} from "@stackframe/stack";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function CustomSignIn() {
    const [authMethod, setAuthMethod] = useState<'credentials' | 'magic-link'>('credentials');

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto p-8 bg-white rounded-lg shadow-md">
            <div className="mb-6 w-full">
                <h1 className="text-2xl font-bold text-center text-charcoal mb-2">Sign in to your account</h1>
                <p className="text-darkGray text-center mb-6">Welcome back! Please sign in to access your account.</p>

                {/* OAuth buttons */}
                <div className="mb-6">
                    <OAuthButtonGroup />
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-lightGray"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-darkGray">Or continue with</span>
                    </div>
                </div>

                {/* Method selector */}
                <div className="flex mb-6 border border-lightGray rounded-md">
                    <button
                        className={`flex-1 py-2 text-center ${authMethod === 'credentials' ? 'bg-primary text-white' : 'bg-white text-darkGray hover:bg-beige'}`}
                        onClick={() => setAuthMethod('credentials')}
                    >
                        Password
                    </button>
                    <button
                        className={`flex-1 py-2 text-center ${authMethod === 'magic-link' ? 'bg-primary text-white' : 'bg-white text-darkGray hover:bg-beige'}`}
                        onClick={() => setAuthMethod('magic-link')}
                    >
                        Magic Link
                    </button>
                </div>

                {/* Authentication forms */}
                <div className="space-y-4">
                    {authMethod === 'credentials' ? (
                        <CredentialSignIn className="space-y-4" />
                    ) : (
                        <MagicLinkSignIn className="space-y-4" />
                    )}
                </div>

                <div className="mt-6 text-center">
                    <p className="text-darkGray">
                        Don't have an account?{" "}
                        <Link href="/handler/signup" className="text-primary hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
} 