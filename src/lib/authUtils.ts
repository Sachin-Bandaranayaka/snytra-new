import { cookies } from 'next/headers';
import { sql } from '@/db/postgres';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface User {
    id: string | number;
    email: string;
    name?: string;
    role: string;
    [key: string]: any;
}

export async function getServerUser(): Promise<User | null> {
    try {
        // First try to get user from NextAuth session
        const session = await getServerSession(authOptions);

        if (session?.user) {
            return {
                id: session.user.id || '',
                email: session.user.email || '',
                name: session.user.name || '',
                role: session.user.role || 'user',
                ...session.user
            };
        }

        // If no session, try to check for admin_email cookie
        const cookieStore = cookies();
        const adminEmail = cookieStore.get('admin_email')?.value;

        if (adminEmail) {
            // Verify if the admin email exists in the database
            try {
                const users = await sql`
          SELECT * FROM users 
          WHERE email = ${adminEmail}
        `;

                if (users && users.length > 0) {
                    const user = users[0];
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        ...user
                    };
                }
            } catch (dbError) {
                console.error('Database error checking admin:', dbError);
            }
        }

        return null;
    } catch (error) {
        console.error('Error getting server user:', error);
        return null;
    }
}

export async function isUserAdmin(): Promise<boolean> {
    const user = await getServerUser();
    return user?.role === 'admin';
} 