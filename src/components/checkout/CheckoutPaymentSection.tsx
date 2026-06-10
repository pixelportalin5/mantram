"use client";

import CheckoutSection from "@/components/checkout/CheckoutSection";
import type { PaymentMethodId } from "@/lib/checkout-types";
import { PAYMENT_METHODS } from "@/lib/checkout-types";

type CheckoutPaymentSectionProps = {
  selectedMethod: PaymentMethodId;
  onSelectMethod: (method: PaymentMethodId) => void;
  isSubmitting: boolean;
  onPayNow: () => void;
};

export default function CheckoutPaymentSection({
  selectedMethod,
  onSelectMethod,
  isSubmitting,
  onPayNow,
}: CheckoutPaymentSectionProps) {
  return (
    <CheckoutSection
      title="Payment"
      description="Select a payment method. Gateway integration coming soon."
    >
      <fieldset className="space-y-3">
        <legend className="sr-only">Payment method</legend>
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <label
              key={method.id}
              className={`flex cursor-pointer items-start gap-4 border p-4 transition-colors ${
                isSelected
                  ? "border-[var(--color-ink-soft)] bg-[var(--color-bg-warm)]"
                  : "border-[var(--color-line)] bg-white hover:border-[var(--color-faint)]"
              }`}
            >
              <input
                type="radio"
                name="payment-method"
                value={method.id}
                checked={isSelected}
                onChange={() => onSelectMethod(method.id)}
                className="mt-1 h-4 w-4 border-[var(--color-line)]"
              />
              <span className="flex-1">
                <span className="block text-sm font-medium uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
                  {method.label}
                </span>
                <span className="mt-1 block text-sm text-[var(--color-muted)]">
                  {method.description}
                </span>
                {method.id !== "cod" ? (
                  <span className="mt-2 block text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-faint)]">
                    SDK placeholder — not yet connected
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </fieldset>

      <button
        type="button"
        onClick={onPayNow}
        disabled={isSubmitting}
        className="btn btn-primary mt-8 w-full transition-transform duration-300 hover:translate-y-[-1px]"
      >
        {isSubmitting ? "Processing…" : "Pay Now"}
      </button>

      <p className="mt-4 text-center text-xs leading-5 text-[var(--color-faint)]">
        By placing your order you agree to Mantriva&apos;s terms of sale and
        privacy policy.
      </p>
    </CheckoutSection>
  );
}
