import type { CartItem } from "@/lib/cart-storage";

export type PaymentMethodId = "razorpay" | "stripe" | "cashfree" | "cod";

export type CheckoutAddress = {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone?: string;
};

export type CheckoutContact = {
  email: string;
  phone: string;
};

export type CheckoutFormData = {
  contact: CheckoutContact;
  shipping: CheckoutAddress;
  billingSameAsShipping: boolean;
  billing: CheckoutAddress;
  orderNotes: string;
};

export type CheckoutTotals = {
  subtotal: number;
  shipping: number;
  taxes: number;
  grandTotal: number;
};

/** Payload passed to payment gateway handlers (Razorpay, Stripe, etc.). */
export type CheckoutSubmitPayload = {
  form: CheckoutFormData;
  paymentMethod: PaymentMethodId;
  items: CartItem[];
  totals: CheckoutTotals;
};

export type CheckoutSubmitResult = {
  success: boolean;
  orderId?: string;
  redirectUrl: string;
  error?: string;
};

export const PAYMENT_METHODS: Array<{
  id: PaymentMethodId;
  label: string;
  description: string;
}> = [
  {
    id: "razorpay",
    label: "Razorpay",
    description: "Cards, UPI, netbanking & wallets",
  },
  {
    id: "stripe",
    label: "Stripe",
    description: "International cards",
  },
  {
    id: "cashfree",
    label: "Cashfree",
    description: "UPI & domestic payments",
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay when your order arrives",
  },
];

export const EMPTY_ADDRESS: CheckoutAddress = {
  firstName: "",
  lastName: "",
  company: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postcode: "",
  country: "IN",
  phone: "",
};

export const DEFAULT_CHECKOUT_FORM: CheckoutFormData = {
  contact: { email: "", phone: "" },
  shipping: { ...EMPTY_ADDRESS },
  billingSameAsShipping: true,
  billing: { ...EMPTY_ADDRESS },
  orderNotes: "",
};
