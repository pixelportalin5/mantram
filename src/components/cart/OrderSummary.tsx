"use client";

import Link from "next/link";

import CartTrustBadges from "@/components/cart/CartTrustBadges";
import { formatCurrency } from "@/lib/format";

type OrderSummaryProps = {
  subtotal: number;
  isCheckingOut: boolean;
  onCheckout: () => void;
  continueHref?: string;
  continueLabel?: string;
  className?: string;
};

export default function OrderSummary({
  subtotal,
  isCheckingOut,
  onCheckout,
  continueHref = "/shop",
  continueLabel = "Continue Shopping",
  className = "",
}: OrderSummaryProps) {
  return (
    <div
      className={`border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-luxury-sm)] lg:p-8 ${className}`}
    >
      <h2 className="font-serif text-2xl font-light tracking-[-0.02em] text-[var(--color-ink-soft)]">
        Order Summary
      </h2>

      <dl className="mt-8 space-y-4 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-[var(--color-muted)]">Subtotal</dt>
          <dd className="font-medium text-[var(--color-ink-soft)]">
            {formatCurrency(subtotal)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-[var(--color-muted)]">Shipping</dt>
          <dd className="text-right text-[var(--color-ink-soft)]">
            Complimentary Worldwide Delivery
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-[var(--color-muted)]">Taxes</dt>
          <dd className="text-right text-[var(--color-faint)]">
            Calculated at checkout
          </dd>
        </div>
      </dl>

      <div className="my-6 h-px bg-[var(--color-line)]" />

      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--color-faint)]">
          Total
        </span>
        <span className="font-serif text-3xl font-light tracking-[-0.02em] text-[var(--color-ink-soft)]">
          {formatCurrency(subtotal)}
        </span>
      </div>

      <button
        type="button"
        onClick={onCheckout}
        disabled={isCheckingOut}
        className="btn btn-primary mt-8 w-full transition-transform duration-300 hover:translate-y-[-1px]"
      >
        {isCheckingOut ? "Preparing checkout…" : "Proceed to Checkout"}
      </button>

      <Link
        href={continueHref}
        className="btn btn-secondary mt-3 w-full"
      >
        {continueLabel}
      </Link>

      <CartTrustBadges />
    </div>
  );
}
