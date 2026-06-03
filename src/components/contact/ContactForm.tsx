"use client";

import { useState } from "react";

import { useToast } from "@/context/ToastContext";

type FormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (form.name.trim().length < 2) errors.name = "Please enter your full name.";
  if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = "Please enter a valid email.";
  }
  if (form.subject.trim().length < 2) errors.subject = "Add a brief subject.";
  if (form.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters.";
  }
  return errors;
}

export default function ContactForm() {
  const { notify } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, true>>>(
    {},
  );
  const [working, setWorking] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (touched[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const blur = (key: keyof FormState) => () => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    const fieldErrors = validate(form);
    if (fieldErrors[key]) {
      setErrors((prev) => ({ ...prev, [key]: fieldErrors[key] }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fieldErrors = validate(form);
    setErrors(fieldErrors);
    setTouched({
      name: true,
      email: true,
      phone: true,
      subject: true,
      message: true,
    });

    if (Object.keys(fieldErrors).length) {
      notify("Please correct the highlighted fields.", "error");
      return;
    }

    setWorking(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        ok?: boolean;
      };

      if (!response.ok || !payload.ok) {
        const message =
          payload.error || "We couldn't send your message. Please try again.";
        notify(message, "error");
        return;
      }

      setSubmitted(true);
      setForm(EMPTY_FORM);
      setErrors({});
      setTouched({});
      notify("Thank you — we'll be in touch shortly.", "success");
    } catch {
      notify("Network error. Please try again.", "error");
    } finally {
      setWorking(false);
    }
  };

  if (submitted) {
    return (
      <div className="border border-[var(--color-line)] bg-white p-10 text-center lg:p-14">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-faint)]">
          Enquiry received
        </p>
        <h3 className="display-3 mt-4">Thank you for writing.</h3>
        <p className="mx-auto mt-4 max-w-md text-[14px] leading-7 text-[var(--color-muted)]">
          A member of the concierge team will respond within one business day.
          We're glad to have you in the journal.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="btn btn-secondary mt-8"
        >
          Send Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Honeypot — visible to bots, hidden from humans. */}
      <input
        type="text"
        name="honeypot"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          id="contact-name"
          label="Name"
          autoComplete="name"
          value={form.name}
          onChange={set("name")}
          onBlur={blur("name")}
          error={errors.name}
          required
        />
        <Field
          id="contact-email"
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={set("email")}
          onBlur={blur("email")}
          error={errors.email}
          required
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          id="contact-phone"
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={set("phone")}
          onBlur={blur("phone")}
          error={errors.phone}
        />
        <Field
          id="contact-subject"
          label="Subject"
          value={form.subject}
          onChange={set("subject")}
          onBlur={blur("subject")}
          error={errors.subject}
          required
        />
      </div>

      <FieldArea
        id="contact-message"
        label="Message"
        value={form.message}
        onChange={set("message")}
        onBlur={blur("message")}
        error={errors.message}
        required
      />

      <div className="flex flex-col items-start gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-faint)]">
          We respond within one business day.
        </p>
        <button
          type="submit"
          disabled={working}
          className="btn btn-primary px-10"
        >
          {working ? "Sending…" : "Send Enquiry"}
        </button>
      </div>
    </form>
  );
}

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
};

function Field({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  type = "text",
  autoComplete,
  required = false,
}: FieldProps) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-ink-soft)]">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </span>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-3 block h-12 w-full border-b bg-transparent px-0 text-[15px] text-[var(--color-ink-soft)] outline-none transition-colors duration-200 placeholder:text-[var(--color-faint)] focus:border-[var(--color-ink-soft)] ${
          error
            ? "border-[var(--color-danger)]"
            : "border-[var(--color-line)] hover:border-[var(--color-faint)]"
        }`}
      />
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 text-[12px] text-[var(--color-danger)]"
        >
          {error}
        </p>
      ) : null}
    </label>
  );
}

type FieldAreaProps = Omit<FieldProps, "type" | "autoComplete">;

function FieldArea({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  required = false,
}: FieldAreaProps) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-ink-soft)]">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </span>
      <textarea
        id={id}
        name={id}
        rows={5}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-3 block w-full resize-none border-b bg-transparent px-0 py-3 text-[15px] leading-7 text-[var(--color-ink-soft)] outline-none transition-colors duration-200 placeholder:text-[var(--color-faint)] focus:border-[var(--color-ink-soft)] ${
          error
            ? "border-[var(--color-danger)]"
            : "border-[var(--color-line)] hover:border-[var(--color-faint)]"
        }`}
      />
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 text-[12px] text-[var(--color-danger)]"
        >
          {error}
        </p>
      ) : null}
    </label>
  );
}
