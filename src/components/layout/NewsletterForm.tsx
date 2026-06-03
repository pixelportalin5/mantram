"use client";

import { useState } from "react";

import { useToast } from "@/context/ToastContext";
import { siteConfig } from "@/lib/site-config";

type NewsletterVariant = "dark" | "light";

type NewsletterFormProps = {
  variant?: NewsletterVariant;
  showHeading?: boolean;
};

export default function NewsletterForm({
  variant = "dark",
  showHeading = true,
}: NewsletterFormProps) {
  const { notify } = useToast();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      notify("Please enter an email address.", "error");
      return;
    }

    if (!siteConfig.newsletter.actionUrl) {
      notify("Thanks — we'll be in touch soon.", "success");
      setEmail("");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(siteConfig.newsletter.actionUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email: trimmed }).toString(),
      });

      if (response.type === "opaque" || response.ok) {
        notify("Subscribed. Welcome to the journal.", "success");
        setEmail("");
      } else {
        notify("Subscription failed. Please try again.", "error");
      }
    } catch {
      notify("Subscription failed. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (variant === "light") {
    return (
      <form onSubmit={handleSubmit} className="w-full">
        {showHeading ? (
          <>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-ink-soft)]">
              Newsletter
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Receive new arrivals, private previews, and editorial.
            </p>
          </>
        ) : null}
        <div className={`flex flex-col gap-3 sm:flex-row ${showHeading ? "mt-5" : ""}`}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="Email address"
            aria-label="Email address"
            className="min-h-12 flex-1 border border-[var(--color-line)] bg-white px-4 text-sm text-[var(--color-ink-soft)] outline-none transition placeholder:text-[var(--color-faint)] focus:border-[var(--color-ink-soft)]"
          />
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? "Subscribing…" : "Subscribe"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-md">
      {showHeading ? (
        <>
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-white">
            Newsletter
          </p>
          <p className="mt-2 text-sm text-white/65">
            Receive new arrivals, private previews, and editorial.
          </p>
        </>
      ) : null}
      <div className={`flex flex-col gap-3 sm:flex-row ${showHeading ? "mt-4" : ""}`}>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="Email address"
          aria-label="Email address"
          className="min-h-12 flex-1 border border-white/30 bg-transparent px-4 text-sm text-white outline-none transition placeholder:text-white/50 focus:border-white"
        />
        <button type="submit" disabled={submitting} className="btn btn-light">
          {submitting ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
    </form>
  );
}
