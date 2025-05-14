"use client";

import { redirect } from 'next/navigation';

export default function AuthHandlerLayout() {
    // Redirect to the new NextAuth login page
    redirect('/login');
}