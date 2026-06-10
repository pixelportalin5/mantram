"use client";

import Image from "next/image";
import Link from "next/link";

import CartTrustBadges from "@/components/cart/CartTrustBadges";
import type { CartItem } from "@/context/CartContext";
import type { CheckoutTotals } from "@/lib/checkout-types";
import { parseCartItemPrice } from "@/lib/checkout-totals";
import { formatCurrency, formatPriceText } from "@/lib/format";
import { isUsableProductImageUrl } from "@/lib/strings";

type CheckoutOrderSummaryProps = {
  items: CartItem[];
  totals: CheckoutTotals;
};

export default function CheckoutOrderSummary({
  items,
  totals,
}: CheckoutOrderSummaryProps) {
  return (
    <div className="border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-luxury-sm)] lg:p-8">
      <h2 className="font-serif text-2xl font-light tracking-[-0.02em] text-[var(--color-ink-soft)]">
        Order Summary
      </h2>

      <ul className="mt-8 divide-y divide-[var(--color-line-soft)]">
        {items.map((item) => {
          const imageUrl = isUsableProductImageUrl(item.image)
            ? item.image
            : null;
          const lineTotal =
            parseCartItemPrice(item.price) * item.quantity;

          return (
            <li
              key={item.databaseId}
              className="flex gap-4 py-5 first:pt-0 last:pb-0"
            >
              <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-[var(--color-bg-warm)]">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={item.name}
                    fill
                    unoptimized
                    sizes="64px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                {item.slug ? (
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-serif text-lg font-light leading-snug text-[var(--color-ink-soft)] hover:text-[var(--color-faint)]"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <p className="font-serif text-lg font-light text-[var(--color-ink-soft)]">
                    {item.name}
                  </p>
                )}
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--color-faint)]">
                  Qty {item.quantity}
                </p>
                <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                  {formatPriceText(item.price)}
                </p>
              </div>
              <p className="price shrink-0 text-sm text-[var(--color-ink-soft)]">
                {formatCurrency(lineTotal)}
              </p>
            </li>
          );
        })}
      </ul>

      <dl className="mt-8 space-y-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--color-muted)]">Subtotal</dt>
          <dd className="font-medium text-[var(--color-ink-soft)]">
            {formatCurrency(totals.subtotal)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--color-muted)]">Shipping</dt>
          <dd className="text-right text-[var(--color-ink-soft)]">
            {totals.shipping === 0
              ? "Complimentary"
              : formatCurrency(totals.shipping)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--color-muted)]">Taxes (est.)</dt>
          <dd className="text-[var(--color-ink-soft)]">
            {formatCurrency(totals.taxes)}
          </dd>
        </div>
      </dl>

      <div className="my-6 h-px bg-[var(--color-line)]" />

      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--color-faint)]">
          Grand Total
        </span>
        <span className="font-serif text-3xl font-light tracking-[-0.02em] text-[var(--color-ink-soft)]">
          {formatCurrency(totals.grandTotal)}
        </span>
      </div>

      <CartTrustBadges />
    </div>
  );
}
