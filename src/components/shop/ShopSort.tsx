"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { ProductSort } from "@/lib/graphql";

const OPTIONS: Array<{ value: ProductSort; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "best-selling", label: "Best Selling" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name (A–Z)" },
];

export default function ShopSort({ value }: { value: ProductSort }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next && next !== "newest") params.set("sort", next);
    else params.delete("sort");
    params.delete("after");
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <label className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-[var(--color-faint)]">
      Sort
      <select
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        className="border border-[var(--color-line)] bg-white px-3 py-2 text-xs uppercase tracking-[0.14em] text-[var(--color-ink-soft)] outline-none focus:border-[var(--color-ink-soft)]"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
