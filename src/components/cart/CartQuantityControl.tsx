"use client";

type CartQuantityControlProps = {
  quantity: number;
  onChange: (quantity: number) => void;
  size?: "sm" | "md";
};

export default function CartQuantityControl({
  quantity,
  onChange,
  size = "md",
}: CartQuantityControlProps) {
  const buttonClass =
    size === "sm"
      ? "h-8 w-8 text-sm"
      : "h-10 w-10 text-base";

  return (
    <div
      className={`inline-flex items-center border border-[var(--color-line)] bg-white ${
        size === "sm" ? "h-8" : "h-10"
      }`}
    >
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        aria-label="Decrease quantity"
        className={`${buttonClass} text-[var(--color-faint)] transition-colors hover:text-[var(--color-ink-soft)] disabled:opacity-30`}
        disabled={quantity <= 1}
      >
        −
      </button>
      <span
        className={`min-w-10 text-center font-medium text-[var(--color-ink-soft)] ${
          size === "sm" ? "text-xs" : "text-sm"
        }`}
        aria-live="polite"
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        aria-label="Increase quantity"
        className={`${buttonClass} text-[var(--color-faint)] transition-colors hover:text-[var(--color-ink-soft)]`}
      >
        +
      </button>
    </div>
  );
}
