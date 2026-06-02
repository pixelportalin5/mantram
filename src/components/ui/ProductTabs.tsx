"use client";

import { useMemo, useState } from "react";

import type { Product, ProductAttribute } from "@/lib/graphql";

type ProductTabsProps = {
  product: Product;
};

type TabKey = "description" | "details" | "shipping";

const TABS: { key: TabKey; label: string }[] = [
  { key: "description", label: "Description" },
  { key: "details", label: "Details" },
  { key: "shipping", label: "Shipping & Returns" },
];

export default function ProductTabs({ product }: ProductTabsProps) {
  const attributes = useMemo<ProductAttribute[]>(
    () => product.attributes?.nodes.filter((attribute) => attribute.visible) ?? [],
    [product.attributes?.nodes],
  );
  const hasDescription = Boolean(product.description);
  const hasDetails = attributes.length > 0;

  const availableTabs = TABS.filter((tab) => {
    if (tab.key === "description") return hasDescription;
    if (tab.key === "details") return hasDetails;
    return true;
  });

  const [active, setActive] = useState<TabKey>(availableTabs[0]?.key ?? "shipping");

  if (!availableTabs.length) return null;

  return (
    <div className="border-y border-[var(--color-line)]">
      <div className="flex flex-wrap gap-x-8 gap-y-2">
        {availableTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`relative py-4 text-[0.72rem] uppercase tracking-[0.2em] transition ${
              active === tab.key
                ? "text-[var(--color-ink-soft)]"
                : "text-[var(--color-faint)] hover:text-[var(--color-ink-soft)]"
            }`}
          >
            {tab.label}
            {active === tab.key ? (
              <span className="absolute -bottom-px left-0 right-0 h-px bg-[var(--color-ink-soft)]" />
            ) : null}
          </button>
        ))}
      </div>

      <div className="py-8">
        {active === "description" && hasDescription ? (
          <div
            className="rich-text max-w-3xl"
            dangerouslySetInnerHTML={{ __html: product.description ?? "" }}
          />
        ) : null}

        {active === "details" && hasDetails ? (
          <dl className="grid max-w-2xl divide-y divide-[var(--color-line-soft)]">
            {attributes.map((attribute) => (
              <div
                key={`${attribute.name}-${attribute.options?.join(",")}`}
                className="grid grid-cols-[140px_1fr] gap-6 py-3 text-sm"
              >
                <dt className="text-[var(--color-faint)] uppercase tracking-[0.16em] text-xs">
                  {attribute.name}
                </dt>
                <dd className="text-[var(--color-ink-soft)]">
                  {attribute.options?.join(", ") || "Available"}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {active === "shipping" ? (
          <div className="grid max-w-3xl gap-6 text-sm leading-7 text-[var(--color-muted)] md:grid-cols-2">
            <div>
              <p className="eyebrow mb-3">Delivery</p>
              <p>
                Insured worldwide delivery within 3–7 business days. Tracking is
                shared via email after the order is dispatched.
              </p>
            </div>
            <div>
              <p className="eyebrow mb-3">Returns</p>
              <p>
                Pieces may be returned for an exchange or refund within 14 days of
                receipt. Bespoke and final-sale orders are non-returnable.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
