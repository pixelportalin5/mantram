import type {
  CheckoutSubmitPayload,
  CheckoutSubmitResult,
} from "@/lib/checkout-types";

/**
 * Checkout submission handler.
 *
 * Plug payment gateways here:
 * - razorpay  → Razorpay SDK / Orders API
 * - stripe    → Stripe Elements / PaymentIntent
 * - cashfree  → Cashfree PG SDK
 * - cod       → WooCommerce order API (no online payment)
 */
export async function submitCheckout(
  payload: CheckoutSubmitPayload,
): Promise<CheckoutSubmitResult> {
  const { paymentMethod } = payload;

  switch (paymentMethod) {
    case "razorpay":
      // TODO: const order = await createRazorpayOrder(payload);
      // TODO: await openRazorpayCheckout(order);
      break;
    case "stripe":
      // TODO: await createStripePaymentIntent(payload);
      break;
    case "cashfree":
      // TODO: await createCashfreeOrder(payload);
      break;
    case "cod":
      // TODO: await createWooCommerceOrder(payload, { payment_method: 'cod' });
      break;
    default:
      break;
  }

  // Temporary: redirect to success until gateways are wired.
  void payload;

  return {
    success: true,
    redirectUrl: "/order-success",
  };
}
