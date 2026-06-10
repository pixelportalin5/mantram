"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { siteConfig } from "@/lib/site-config";

export default function RegisterForm() {
  const router = useRouter();
  const { register, isWorking, isAuthenticated, isReady } = useAuth();
  const { notify } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace("/account");
    }
  }, [isAuthenticated, isReady, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await register({
        email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });
      notify(`Welcome to ${siteConfig.brandName}.`, "success");
      router.replace("/account");
      router.refresh();
    } catch (caught) {
      const message =
        caught instanceof Error && caught.message
          ? caught.message
          : "Could not create your account. Please try again.";
      setError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="label">First Name</span>
          <input
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            className="input"
          />
        </label>
        <label className="block">
          <span className="label">Last Name</span>
          <input
            type="text"
            autoComplete="family-name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            className="input"
          />
        </label>
      </div>

      <label className="block">
        <span className="label">Email</span>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="input"
        />
      </label>

      <label className="block">
        <span className="label">Password</span>
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="input"
          placeholder="Minimum 8 characters"
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
        {isWorking ? "Creating account…" : "Create Account"}
      </button>

      <p className="text-center text-xs leading-5 text-[var(--color-faint)]">
        By continuing you agree to receive transactional communications from{" "}
        {siteConfig.brandName}.
      </p>
    </form>
  );
}
