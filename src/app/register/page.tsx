import Link from "next/link";

import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Create Account",
};

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Account"
      title="Create your account"
      description="Save your details, track orders, and access exclusive previews."
      footer={
        <>
          Already a member?{" "}
          <Link
            href="/login"
            className="border-b border-[var(--color-ink-soft)] pb-0.5 text-[var(--color-ink-soft)]"
          >
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
