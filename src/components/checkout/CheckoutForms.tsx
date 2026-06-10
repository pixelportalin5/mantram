"use client";

import CheckoutAddressFields from "@/components/checkout/CheckoutAddressFields";
import CheckoutSection from "@/components/checkout/CheckoutSection";
import type { CheckoutFormData } from "@/lib/checkout-types";

type CheckoutFormsProps = {
  form: CheckoutFormData;
  onChange: (form: CheckoutFormData) => void;
};

export default function CheckoutForms({ form, onChange }: CheckoutFormsProps) {
  const update = (patch: Partial<CheckoutFormData>) => {
    onChange({ ...form, ...patch });
  };

  return (
    <div className="space-y-8">
      <CheckoutSection
        title="Contact Information"
        description="We will send order updates and delivery notifications here."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="label">Email</span>
            <input
              type="email"
              name="contact-email"
              autoComplete="email"
              required
              value={form.contact.email}
              onChange={(e) =>
                update({
                  contact: { ...form.contact, email: e.target.value },
                })
              }
              className="input"
              placeholder="you@example.com"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="label">Phone</span>
            <input
              type="tel"
              name="contact-phone"
              autoComplete="tel"
              required
              value={form.contact.phone}
              onChange={(e) =>
                update({
                  contact: { ...form.contact, phone: e.target.value },
                })
              }
              className="input"
              placeholder="+91"
            />
          </label>
        </div>
      </CheckoutSection>

      <CheckoutSection
        title="Shipping Address"
        description="Where should we deliver your order?"
      >
        <CheckoutAddressFields
          prefix="shipping"
          value={form.shipping}
          onChange={(shipping) => update({ shipping })}
        />
      </CheckoutSection>

      <CheckoutSection title="Billing Address">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={form.billingSameAsShipping}
            onChange={(e) =>
              update({
                billingSameAsShipping: e.target.checked,
                billing: e.target.checked ? form.shipping : form.billing,
              })
            }
            className="mt-1 h-4 w-4 border-[var(--color-line)] text-[var(--color-ink-soft)]"
          />
          <span className="text-sm leading-6 text-[var(--color-muted)]">
            Same as shipping address
          </span>
        </label>

        {!form.billingSameAsShipping ? (
          <div className="mt-6">
            <CheckoutAddressFields
              prefix="billing"
              value={form.billing}
              onChange={(billing) => update({ billing })}
            />
          </div>
        ) : null}
      </CheckoutSection>

      <CheckoutSection title="Order Notes" description="Optional">
        <label className="block">
          <span className="label">Special instructions</span>
          <textarea
            name="order-notes"
            rows={4}
            value={form.orderNotes}
            onChange={(e) => update({ orderNotes: e.target.value })}
            className="input min-h-[120px] resize-y"
            placeholder="Gift message, delivery preferences, or concierge requests…"
          />
        </label>
      </CheckoutSection>
    </div>
  );
}
