"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { formatPriceText } from "@/lib/format";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeFromCart, cartTotal, checkoutAction, isCheckingOut } = useCart();
  const { notify } = useToast();

  const handleCheckout = async () => {
    try {
      await checkoutAction();
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Could not start checkout.";
      notify(message, "error");
    }
  };

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-[90]">
      <div
        className="absolute inset-0 bg-black/45 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="relative ml-auto flex h-full w-[88%] max-w-[460px] flex-col bg-white animate-slide-in-right">
        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-6 py-5">
          <div>
            <p className="eyebrow">Your Bag</p>
            <p className="mt-1 font-serif text-2xl text-[var(--color-ink-soft)]">
              {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="inline-flex h-10 w-10 items-center justify-center"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-8 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-bg-warm)]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7 text-[var(--color-faint)]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 7h12l-1 11.5A2 2 0 0 1 15 20.5H9a2 2 0 0 1-2-1.95L6 7Zm3 0V5a3 3 0 0 1 6 0v2" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl text-[var(--color-ink-soft)]">
                Your bag is empty
              </h3>
              <p className="mt-2 max-w-xs text-sm text-[var(--color-muted)]">
                Once you find a piece that resonates, it will be saved here for checkout.
              </p>
              <Link
                href="/shop"
                onClick={onClose}
                className="btn btn-primary mt-6"
              >
                Explore the catalog
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--color-line-soft)]">
              {items.map((item) => (
                <li key={item.databaseId} className="flex gap-4 px-6 py-5">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-[var(--color-bg-warm)]">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        unoptimized
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-ink-soft)]">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--color-faint)]">
                        Quantity {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="price text-sm">{formatPriceText(item.price)}</span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.databaseId)}
                        className="text-xs uppercase tracking-[0.18em] text-[var(--color-faint)] hover:text-[var(--color-ink-soft)]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <div className="border-t border-[var(--color-line)] px-6 py-5">
            <div className="flex items-center justify-between text-sm">
              <span className="uppercase tracking-[0.2em] text-[var(--color-faint)]">
                Subtotal
              </span>
              <span className="font-serif text-xl text-[var(--color-ink-soft)]">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(cartTotal)}
              </span>
            </div>
            <p className="mt-2 text-xs text-[var(--color-faint)]">
              Shipping, taxes, and discounts are calculated at checkout.
            </p>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="btn btn-primary mt-5 w-full"
            >
              {isCheckingOut ? "Preparing checkout…" : "Proceed to Checkout"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost mt-1 w-full"
            >
              Continue Browsing
            </button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
