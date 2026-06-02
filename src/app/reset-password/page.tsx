import { Suspense } from "react";

import AuthShell from "@/components/auth/AuthShell";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata = {
  title: "Reset Password",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account"
      title="Set a new password"
      description="Choose a strong, unique password to secure your account."
    >
      <Suspense fallback={<div className="skeleton h-12 w-full" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
