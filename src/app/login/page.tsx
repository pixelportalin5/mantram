import Link from "next/link";
import { Suspense } from "react";

import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Account"
      title="Welcome back"
      description="Sign in to access your orders, profile, and saved details."
      footer={
        <>
          New to Mantram?{" "}
          <Link
            href="/register"
            className="border-b border-[var(--color-ink-soft)] pb-0.5 text-[var(--color-ink-soft)]"
          >
            Create an account
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="skeleton h-12 w-full" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
