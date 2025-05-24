"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function MaintenancePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
                <div className="mb-6 flex justify-center">
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg
                                className="w-16 h-16 text-primary animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-primary mb-2">
                    We're under maintenance
                </h1>

                <p className="text-gray-600 mb-8">
                    We're working hard to improve the experience for you. Please check back soon.
                </p>

                <div className="flex flex-col space-y-4">
                    <Link
                        href="/admin/login"
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition duration-200"
                    >
                        Admin Login
                    </Link>

                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition duration-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );
} 