"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import CheckoutForms from "@/components/checkout/CheckoutForms";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";
import CheckoutPaymentSection from "@/components/checkout/CheckoutPaymentSection";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { submitCheckout } from "@/lib/checkout-submit";
import { calculateCheckoutTotals } from "@/lib/checkout-totals";
import {
  DEFAULT_CHECKOUT_FORM,
  type CheckoutFormData,
  type PaymentMethodId,
} from "@/lib/checkout-types";

export default function CheckoutPageContent() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { notify } = useToast();

  const [form, setForm] = useState<CheckoutFormData>(DEFAULT_CHECKOUT_FORM);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodId>("razorpay");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const totals = useMemo(() => calculateCheckoutTotals(items), [items]);

  useEffect(() => {
    if (!isReady) return;
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [isReady, items.length, router]);

  const handlePayNow = async () => {
    if (!form.contact.email || !form.contact.phone) {
      notify("Please complete contact information.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const billing = form.billingSameAsShipping ? form.shipping : form.billing;

      const result = await submitCheckout({
        form: { ...form, billing },
        paymentMethod,
        items,
        totals,
      });

      if (!result.success) {
        throw new Error(result.error ?? "Payment could not be completed.");
      }

      clearCart();
      router.push(result.redirectUrl);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Could not complete checkout.";
      notify(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady || items.length === 0) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)]">
        <div className="container-app py-20">
          <div className="skeleton h-12 w-64" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="container-app py-12 lg:py-20">
        <header className="max-w-3xl">
          <p className="eyebrow">Checkout</p>
          <h1 className="display-2 mt-4 text-[var(--color-ink-soft)]">
            Complete Your Order
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-[var(--color-muted)]">
            A refined checkout experience — secure payment, complimentary
            delivery, and concierge care.
          </p>
        </header>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:gap-14 xl:grid-cols-[7fr_3fr]">
          <div className="space-y-8">
            <CheckoutForms form={form} onChange={setForm} />
            <CheckoutPaymentSection
              selectedMethod={paymentMethod}
              onSelectMethod={setPaymentMethod}
              isSubmitting={isSubmitting}
              onPayNow={handlePayNow}
            />
          </div>

          <aside className="lg:sticky lg:top-32 lg:self-start">
            <CheckoutOrderSummary items={items} totals={totals} />
            <Link href="/cart" className="btn btn-secondary mt-4 w-full">
              Return to Bag
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
