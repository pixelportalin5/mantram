"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isWorking, isAuthenticated, isReady } = useAuth();
  const { notify } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const redirect = searchParams.get("redirect") || "/account";

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace(redirect);
    }
  }, [isAuthenticated, isReady, redirect, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      await login({ username: email, password });
      notify("Welcome back.", "success");
      router.replace(redirect);
      router.refresh();
    } catch (caught) {
      const message =
        caught instanceof Error && caught.message
          ? caught.message
          : "Sign-in failed. Please try again.";
      setError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block">
        <span className="label">Email or Username</span>
        <input
          type="text"
          name="username"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="input"
          placeholder="you@example.com"
        />
      </label>

      <label className="block">
        <span className="label">Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="input"
          placeholder="••••••••"
        />
      </label>

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-xs uppercase tracking-[0.16em] text-[var(--color-faint)] hover:text-[var(--color-ink-soft)]"
        >
          Forgot password?
        </Link>
      </div>

      {error ? (
        <div
          role="alert"
          className="border border-[var(--color-danger)] bg-[var(--color-danger)]/5 px-4 py-3 text-sm text-[var(--color-danger)]"
        >
          {error}
        </div>
      ) : null}

      <button type="submit" disabled={isWorking} className="btn btn-primary w-full">
        {isWorking ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
