"use client";

import { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import type { CustomerAddress, CustomerProfile } from "@/lib/auth-types";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  billing: Required<CustomerAddress>;
  shipping: Required<CustomerAddress>;
};

function mergeAddress(
  source: CustomerAddress | null | undefined,
): Required<CustomerAddress> {
  return {
    firstName: source?.firstName ?? "",
    lastName: source?.lastName ?? "",
    company: source?.company ?? "",
    address1: source?.address1 ?? "",
    address2: source?.address2 ?? "",
    city: source?.city ?? "",
    state: source?.state ?? "",
    postcode: source?.postcode ?? "",
    country: source?.country ?? "",
    email: source?.email ?? "",
    phone: source?.phone ?? "",
  };
}

type ProfileFormProps = {
  initialProfile: CustomerProfile | null;
};

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const { saveProfile } = useAuth();
  const { notify } = useToast();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    firstName: initialProfile?.firstName ?? "",
    lastName: initialProfile?.lastName ?? "",
    email: initialProfile?.email ?? "",
    billing: mergeAddress(initialProfile?.billing),
    shipping: mergeAddress(initialProfile?.shipping),
  });

  const updateAddress = (
    type: "billing" | "shipping",
    field: keyof CustomerAddress,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [type]: { ...current[type], [field]: value },
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setWorking(true);
    try {
      const next = await saveProfile({
        firstName: form.firstName || null,
        lastName: form.lastName || null,
        email: form.email || null,
        billing: form.billing,
        shipping: form.shipping,
      });
      if (next) {
        setForm({
          firstName: next.firstName ?? "",
          lastName: next.lastName ?? "",
          email: next.email ?? "",
          billing: mergeAddress(next.billing),
          shipping: mergeAddress(next.shipping),
        });
      }
      notify("Profile updated.", "success");
    } catch (caught) {
      const message =
        caught instanceof Error && caught.message
          ? caught.message
          : "Could not update your profile.";
      setError(message);
      notify(message, "error");
    } finally {
      setWorking(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <section className="account-card border border-[var(--color-line)] bg-white p-6 lg:p-8">
        <h3 className="text-[0.72rem] uppercase tracking-[0.22em] text-[var(--color-ink-soft)]">
          Personal Details
        </h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field
            label="First Name"
            value={form.firstName}
            onChange={(value) => setForm({ ...form, firstName: value })}
          />
          <Field
            label="Last Name"
            value={form.lastName}
            onChange={(value) => setForm({ ...form, lastName: value })}
          />
          <Field
            label="Email"
            type="email"
            className="sm:col-span-2"
            value={form.email}
            onChange={(value) => setForm({ ...form, email: value })}
          />
        </div>
      </section>

      <AddressSection
        title="Billing Address"
        address={form.billing}
        onUpdate={(field, value) => updateAddress("billing", field, value)}
      />

      <AddressSection
        title="Shipping Address"
        address={form.shipping}
        onUpdate={(field, value) => updateAddress("shipping", field, value)}
        compact
      />

      {error ? (
        <div
          role="alert"
          className="border border-[var(--color-danger)] bg-[var(--color-danger)]/5 px-4 py-3 text-sm text-[var(--color-danger)]"
        >
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <span className="text-break-safe text-xs uppercase tracking-[0.16em] text-[var(--color-faint)]">
          {initialProfile?.username
            ? `Username: ${initialProfile.username}`
            : null}
        </span>
        <button type="submit" disabled={working} className="btn btn-primary">
          {working ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="label">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input text-break-safe"
      />
    </label>
  );
}

function AddressSection({
  title,
  address,
  onUpdate,
  compact = false,
}: {
  title: string;
  address: Required<CustomerAddress>;
  onUpdate: (field: keyof CustomerAddress, value: string) => void;
  compact?: boolean;
}) {
  return (
    <section className="account-card border border-[var(--color-line)] bg-white p-6 lg:p-8">
      <h3 className="text-[0.72rem] uppercase tracking-[0.22em] text-[var(--color-ink-soft)]">
        {title}
      </h3>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field
          label="First Name"
          value={address.firstName ?? ""}
          onChange={(value) => onUpdate("firstName", value)}
        />
        <Field
          label="Last Name"
          value={address.lastName ?? ""}
          onChange={(value) => onUpdate("lastName", value)}
        />
        <Field
          label="Address Line 1"
          className="sm:col-span-2"
          value={address.address1 ?? ""}
          onChange={(value) => onUpdate("address1", value)}
        />
        <Field
          label="Address Line 2"
          className="sm:col-span-2"
          value={address.address2 ?? ""}
          onChange={(value) => onUpdate("address2", value)}
        />
        <Field
          label="City"
          value={address.city ?? ""}
          onChange={(value) => onUpdate("city", value)}
        />
        <Field
          label="State / Region"
          value={address.state ?? ""}
          onChange={(value) => onUpdate("state", value)}
        />
        <Field
          label="Postcode"
          value={address.postcode ?? ""}
          onChange={(value) => onUpdate("postcode", value)}
        />
        <Field
          label="Country"
          value={address.country ?? ""}
          onChange={(value) => onUpdate("country", value)}
        />
        {compact ? null : (
          <>
            <Field
              label="Phone"
              value={address.phone ?? ""}
              onChange={(value) => onUpdate("phone", value)}
            />
            <Field
              label="Email"
              type="email"
              value={address.email ?? ""}
              onChange={(value) => onUpdate("email", value)}
            />
          </>
        )}
      </div>
    </section>
  );
}
