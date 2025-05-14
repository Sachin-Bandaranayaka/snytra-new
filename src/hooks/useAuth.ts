"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useAuth() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const login = async (email: string, password: string) => {
        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                return { success: false, error: result.error };
            }

            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || "An error occurred during login",
            };
        }
    };

    const logout = async () => {
        await signOut({ redirect: false });
        router.push("/login");
    };

    return {
        user: session?.user,
        isAuthenticated: !!session?.user,
        loading: status === "loading",
        login,
        logout,
    };
} 