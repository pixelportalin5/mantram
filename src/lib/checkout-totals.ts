import type { CartItem } from "@/lib/cart-storage";
import type { CheckoutTotals } from "@/lib/checkout-types";

export function parseCartItemPrice(price: string): number {
  const plain = price.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  const match = plain.match(/[\d,.]+/)?.[0];
  if (!match) return 0;
  const parsed = Number.parseFloat(match.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Complimentary shipping; taxes shown as estimated GST for display. */
export function calculateCheckoutTotals(items: CartItem[]): CheckoutTotals {
  const subtotal = items.reduce(
    (sum, item) => sum + parseCartItemPrice(item.price) * item.quantity,
    0,
  );
  const shipping = 0;
  const taxes = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + shipping + taxes;

  return { subtotal, shipping, taxes, grandTotal };
}
