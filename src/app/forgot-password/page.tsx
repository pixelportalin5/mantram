import Link from "next/link";

import AuthShell from "@/components/auth/AuthShell";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata = {
  title: "Forgot Password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account"
      title="Reset your password"
      description="Enter the email associated with your account and we'll send you a link to set a new password."
      footer={
        <>
          Remembered your password?{" "}
          <Link
            href="/login"
            className="border-b border-[var(--color-ink-soft)] pb-0.5 text-[var(--color-ink-soft)]"
          >
            Sign in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
