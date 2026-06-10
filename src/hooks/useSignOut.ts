"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { useAuth } from "@/context/AuthContext";
import { AUTH_DEBUG } from "@/lib/auth-guard";

/**
 * Full sign-out: destroy server session, clear client state, redirect to login.
 */
export function useSignOut() {
  const router = useRouter();
  const { logout } = useAuth();

  return useCallback(async () => {
    await logout();

    if (AUTH_DEBUG) {
      console.log("Redirecting To Login");
    }

    router.replace("/login");
    router.refresh();
  }, [logout, router]);
}
