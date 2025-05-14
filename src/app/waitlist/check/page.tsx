import { redirect } from 'next/navigation';

export default function WaitlistCheckRedirect() {
    redirect('/menu/waitlist/check');
    return null;
} 