import { redirect } from 'next/navigation';

export default function WaitlistRedirect() {
    redirect('/menu/waitlist');
    return null;
} 