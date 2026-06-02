"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword, isWorking } = useAuth();
  const { notify } = useToast();

  const key = searchParams.get("key") ?? "";
  const login = searchParams.get("login") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!key || !login) {
    return (
      <div className="space-y-4 text-sm leading-7 text-[var(--color-muted)]">
        <p>This reset link is incomplete or has expired.</p>
        <Link href="/forgot-password" className="btn btn-primary w-full">
          Request a new link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await resetPassword({ key, login, password });
      setSuccess(true);
      notify("Password updated. Please sign in.", "success");
      setTimeout(() => router.replace("/login"), 1500);
    } catch (caught) {
      const message =
        caught instanceof Error && caught.message
          ? caught.message
          : "Could not reset your password.";
      setError(message);
    }
  };

  if (success) {
    return (
      <p className="text-sm leading-7 text-[var(--color-muted)]">
        Your password has been updated. Redirecting to sign-in…
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block">
        <span className="label">New Password</span>
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="input"
        />
      </label>

      <label className="block">
        <span className="label">Confirm Password</span>
        <input
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          className="input"
        />
      </label>

      {error ? (
        <div
          role="alert"
          className="border border-[var(--color-danger)] bg-[var(--color-danger)]/5 px-4 py-3 text-sm text-[var(--color-danger)]"
        >
          {error}
        </div>
      ) : null}

      <button type="submit" disabled={isWorking} className="btn btn-primary w-full">
        {isWorking ? "Saving…" : "Update Password"}
      </button>
    </form>
  );
}
