"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import type { ProductCategory } from "@/lib/graphql";

type ShopFiltersProps = {
  categories: ProductCategory[];
  activeCategory: string | undefined;
  totalCount: number;
  minPrice: string;
  maxPrice: string;
  attributes: string[];
  activeAttribute: string | undefined;
  search: string | undefined;
};

export default function ShopFilters({
  categories,
  activeCategory,
  totalCount,
  minPrice,
  maxPrice,
  attributes,
  activeAttribute,
  search,
}: ShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);
  const [localAttr, setLocalAttr] = useState(activeAttribute ?? "");

  useEffect(() => setLocalMin(minPrice), [minPrice]);
  useEffect(() => setLocalMax(maxPrice), [maxPrice]);
  useEffect(() => setLocalAttr(activeAttribute ?? ""), [activeAttribute]);

  const buildQuery = (overrides: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(overrides)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    next.delete("after");
    return next.toString();
  };

  const applyFilters = () => {
    const queryString = buildQuery({
      minPrice: localMin || null,
      maxPrice: localMax || null,
      attribute: localAttr || null,
    });
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`);
    setOpen(false);
  };

  const clearFilters = () => {
    router.push(pathname);
    setOpen(false);
  };

  const hasFilters = Boolean(
    activeCategory || minPrice || maxPrice || activeAttribute || search,
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-secondary lg:hidden"
      >
        Filters
        {hasFilters ? (
          <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-ink-soft)] text-[10px] text-white">
            •
          </span>
        ) : null}
      </button>

      <aside className="hidden lg:block">
        <FiltersForm
          categories={categories}
          activeCategory={activeCategory}
          totalCount={totalCount}
          localMin={localMin}
          localMax={localMax}
          localAttr={localAttr}
          attributes={attributes}
          setLocalMin={setLocalMin}
          setLocalMax={setLocalMax}
          setLocalAttr={setLocalAttr}
          applyFilters={applyFilters}
          clearFilters={clearFilters}
          hasFilters={hasFilters}
        />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[88%] max-w-[400px] flex-col bg-[var(--color-bg)] animate-slide-in-left">
            <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4">
              <span className="font-serif text-xl">Filter</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="inline-flex h-10 w-10 items-center justify-center"
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
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <FiltersForm
                categories={categories}
                activeCategory={activeCategory}
                totalCount={totalCount}
                localMin={localMin}
                localMax={localMax}
                localAttr={localAttr}
                attributes={attributes}
                setLocalMin={setLocalMin}
                setLocalMax={setLocalMax}
                setLocalAttr={setLocalAttr}
                applyFilters={applyFilters}
                clearFilters={clearFilters}
                hasFilters={hasFilters}
              />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function FiltersForm({
  categories,
  activeCategory,
  totalCount,
  localMin,
  localMax,
  localAttr,
  attributes,
  setLocalMin,
  setLocalMax,
  setLocalAttr,
  applyFilters,
  clearFilters,
  hasFilters,
}: {
  categories: ProductCategory[];
  activeCategory: string | undefined;
  totalCount: number;
  localMin: string;
  localMax: string;
  localAttr: string;
  attributes: string[];
  setLocalMin: (value: string) => void;
  setLocalMax: (value: string) => void;
  setLocalAttr: (value: string) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  hasFilters: boolean;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        applyFilters();
      }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-ink-soft)]">
          Categories
        </h2>
        <div className="mt-4 space-y-2">
          <Link
            href="/shop"
            className={`flex items-center justify-between border-b border-[var(--color-line-soft)] py-2 text-sm ${
              !activeCategory
                ? "text-[var(--color-ink-soft)]"
                : "text-[var(--color-muted)] hover:text-[var(--color-ink-soft)]"
            }`}
          >
            <span>All products</span>
            <span className="text-xs text-[var(--color-faint)]">{totalCount}</span>
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className={`flex items-center justify-between border-b border-[var(--color-line-soft)] py-2 text-sm transition ${
                activeCategory === category.slug
                  ? "text-[var(--color-ink-soft)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-ink-soft)]"
              }`}
            >
              <span>{category.name}</span>
              <span className="text-xs text-[var(--color-faint)]">
                {category.count ?? 0}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-ink-soft)]">
          Price Range
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <input
            type="number"
            min={0}
            value={localMin}
            onChange={(event) => setLocalMin(event.target.value)}
            placeholder="Min"
            className="input"
          />
          <input
            type="number"
            min={0}
            value={localMax}
            onChange={(event) => setLocalMax(event.target.value)}
            placeholder="Max"
            className="input"
          />
        </div>
      </div>

      {attributes.length ? (
        <div>
          <h2 className="text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-ink-soft)]">
            Attributes
          </h2>
          <select
            value={localAttr}
            onChange={(event) => setLocalAttr(event.target.value)}
            className="input mt-4"
          >
            <option value="">All attributes</option>
            {attributes.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="space-y-2 pt-2">
        <button type="submit" className="btn btn-primary w-full">
          Apply Filters
        </button>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="btn btn-ghost w-full"
          >
            Clear All
          </button>
        ) : null}
      </div>
    </form>
  );
}
