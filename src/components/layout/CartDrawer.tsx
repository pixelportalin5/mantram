"use client";

import Link from "next/link";
import { useEffect } from "react";

import CartLineItem from "@/components/cart/CartLineItem";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { formatCurrency } from "@/lib/format";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const {
    items,
    updateQuantity,
    removeFromCart,
    cartTotal,
    itemCount,
    checkoutAction,
    isCheckingOut,
  } = useCart();
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

  return (
    <div className="fixed inset-0 z-[90]">
      <div
        className="absolute inset-0 bg-black/45 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="relative ml-auto flex h-full w-[92%] max-w-[480px] flex-col bg-[var(--color-bg)] animate-slide-in-right"
        aria-label="Shopping bag"
      >
        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-6 py-5">
          <div>
            <p className="eyebrow">Shopping Bag</p>
            <p className="mt-1 font-serif text-2xl font-light text-[var(--color-ink-soft)]">
              {itemCount} {itemCount === 1 ? "piece" : "pieces"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close bag"
            className="inline-flex h-10 w-10 items-center justify-center text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-faint)]"
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

        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <p className="eyebrow">Empty</p>
              <h3 className="mt-4 font-serif text-2xl font-light text-[var(--color-ink-soft)]">
                Your bag is empty
              </h3>
              <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--color-muted)]">
                You have not added any pieces yet.
              </p>
              <Link
                href="/shop"
                onClick={onClose}
                className="btn btn-primary mt-8"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--color-line-soft)]">
              {items.map((item) => (
                <li key={item.databaseId} className="py-5">
                  <CartLineItem
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                    layout="drawer"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <div className="border-t border-[var(--color-line)] bg-white px-6 py-5 shadow-[var(--shadow-luxury-sm)]">
            <div className="flex items-baseline justify-between">
              <span className="text-[0.68rem] uppercase tracking-[0.22em] text-[var(--color-faint)]">
                Subtotal
              </span>
              <span className="font-serif text-2xl font-light text-[var(--color-ink-soft)]">
                {formatCurrency(cartTotal)}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--color-faint)]">
              Complimentary delivery. Taxes calculated at checkout.
            </p>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="btn btn-primary mt-5 w-full"
            >
              {isCheckingOut ? "Preparing checkout…" : "Checkout"}
            </button>

            <Link
              href="/cart"
              onClick={onClose}
              className="btn btn-secondary mt-3 w-full"
            >
              View Bag
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost mt-1 w-full"
            >
              Continue Shopping
            </button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
