"use client";

import Link from "next/link";

import { siteConfig } from "@/lib/site-config";

export default function OrderSuccessContent() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] py-16 lg:py-24">
      <div className="container-app">
        <div className="mx-auto max-w-xl text-center">
          <p className="eyebrow">Order Confirmed</p>
          <h1 className="display-2 mt-6 text-[var(--color-ink-soft)]">
            Thank you for your order
          </h1>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-7 text-[var(--color-muted)]">
            Your order has been received. A confirmation email will arrive
            shortly with delivery details and concierge support information.
          </p>

          <div className="mt-10 border border-[var(--color-line)] bg-white p-8 shadow-[var(--shadow-luxury-sm)]">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--color-faint)]">
              What happens next
            </p>
            <ul className="mt-6 space-y-4 text-sm leading-6 text-[var(--color-muted)]">
              <li>Our team prepares your pieces with signature packaging.</li>
              <li>You will receive tracking once your order ships.</li>
              <li>Concierge support is available for any aftercare needs.</li>
            </ul>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/shop" className="btn btn-primary">
              Continue Shopping
            </Link>
            <Link href="/account/orders" className="btn btn-secondary">
              View Orders
            </Link>
          </div>

          <p className="mt-10 text-xs text-[var(--color-faint)]">
            {siteConfig.brandName} — curated luxury, ordered with intention.
          </p>
        </div>
      </div>
    </main>
  );
}
