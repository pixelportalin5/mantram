"use client";

import type { ReactNode } from "react";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import type { AuthUser } from "@/lib/auth-types";

type ProvidersProps = {
  children: ReactNode;
  initialUser?: AuthUser | null;
};

export default function Providers({ children, initialUser = null }: ProvidersProps) {
  return (
    <ToastProvider>
      <AuthProvider initialUser={initialUser}>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
