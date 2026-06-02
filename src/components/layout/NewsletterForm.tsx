"use client";

import { useState } from "react";

import { useToast } from "@/context/ToastContext";
import { siteConfig } from "@/lib/site-config";

export default function NewsletterForm() {
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

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-md">
      <p className="text-[0.68rem] uppercase tracking-[0.24em] text-white">
        Newsletter
      </p>
      <p className="mt-2 text-sm text-white/65">
        Receive new arrivals, private previews, and editorial.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="Email address"
          className="min-h-12 flex-1 border border-white/30 bg-transparent px-4 text-sm text-white outline-none transition placeholder:text-white/50 focus:border-white"
        />
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-light"
        >
          {submitting ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
    </form>
  );
}
