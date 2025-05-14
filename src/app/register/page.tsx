import { Metadata, Viewport } from 'next';
import { redirect } from 'next/navigation';
import RegisterPageClient from './client';

export const metadata: Metadata = {
    title: "Sign Up | Snytra",
    description: "Create your Snytra account to streamline your restaurant operations."
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1.0,
};

export default function Register() {
    redirect('/handler/signup');
}