const TRUST_ITEMS = [
  "Complimentary Signature Packaging",
  "Insured Worldwide Delivery",
  "Secure Checkout",
  "Concierge Support",
] as const;

export default function CartTrustBadges() {
  return (
    <ul className="space-y-3 border-t border-[var(--color-line-soft)] pt-6">
      {TRUST_ITEMS.map((item) => (
        <li
          key={item}
          className="flex items-start gap-3 text-[0.78rem] leading-6 text-[var(--color-muted)]"
        >
          <span
            className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-[var(--color-gold)]"
            aria-hidden="true"
          >
            ✓
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}
