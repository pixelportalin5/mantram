"use client";

import { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function ForgotPasswordForm() {
  const { requestPasswordReset, isWorking } = useAuth();
  const { notify } = useToast();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!email) return;
    try {
      await requestPasswordReset(email);
      setSubmitted(true);
      notify("If an account exists, a reset email has been sent.", "success");
    } catch (caught) {
      const message =
        caught instanceof Error && caught.message
          ? caught.message
          : "Could not send the reset email.";
      setError(message);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-3 text-sm leading-7 text-[var(--color-muted)]">
        <p>
          If an account exists for <strong className="text-[var(--color-ink-soft)]">{email}</strong>,
          we have sent a link to reset your password.
        </p>
        <p>It may take a few minutes to arrive. Please also check your spam folder.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block">
        <span className="label">Email</span>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="input"
          placeholder="you@example.com"
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
        {isWorking ? "Sending…" : "Send Reset Link"}
      </button>
    </form>
  );
}
