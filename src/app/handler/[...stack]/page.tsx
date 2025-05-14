"use client";

import { redirect } from 'next/navigation';

/**
 * This is the Stack Auth handler page that handles authentication flows,
 * including sign in/up, magic links, account settings, etc.
 */
export default function StackHandlerPage() {
  // Redirect Stack Auth handlers to the new NextAuth login page
  redirect('/login');
}
