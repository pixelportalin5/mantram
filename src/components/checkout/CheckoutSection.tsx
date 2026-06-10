import type { ReactNode } from "react";

type CheckoutSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function CheckoutSection({
  title,
  description,
  children,
}: CheckoutSectionProps) {
  return (
    <section className="border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-luxury-sm)] lg:p-8">
      <header className="border-b border-[var(--color-line-soft)] pb-5">
        <h2 className="font-serif text-2xl font-light tracking-[-0.02em] text-[var(--color-ink-soft)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
            {description}
          </p>
        ) : null}
      </header>
      <div className="mt-6">{children}</div>
    </section>
  );
}
