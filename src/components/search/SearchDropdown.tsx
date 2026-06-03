"use client";

import Image from "next/image";
import Link from "next/link";
import { forwardRef, type ForwardedRef, type MouseEvent } from "react";

import { highlightMatch } from "@/components/search/highlight";
import { formatPriceText } from "@/lib/format";
import type {
  SearchCategoryHit,
  SearchProductHit,
} from "@/lib/graphql";

export type DropdownItem =
  | { kind: "product"; href: string; hit: SearchProductHit }
  | { kind: "category"; href: string; hit: SearchCategoryHit }
  | { kind: "term"; href: string; label: string };

type SearchDropdownProps = {
  id: string;
  query: string;
  status: "idle" | "trending" | "loading" | "ready" | "error";
  products: SearchProductHit[];
  categories: SearchCategoryHit[];
  trendingCategories: SearchCategoryHit[];
  error: string | null;
  items: DropdownItem[];
  activeIndex: number;
  onSelect: (item: DropdownItem) => void;
  onHover: (index: number) => void;
};

function FolderIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 17l6-6 4 4 7-9" />
      <path d="M14 6h6v6" />
    </svg>
  );
}

const SearchDropdown = forwardRef<HTMLDivElement, SearchDropdownProps>(
  function SearchDropdown(
    {
      id,
      query,
      status,
      products,
      categories,
      trendingCategories,
      error,
      items,
      activeIndex,
      onSelect,
      onHover,
    },
    ref: ForwardedRef<HTMLDivElement>,
  ) {
    const isEmptyQuery = query.trim().length === 0;
    const isShortQuery = query.trim().length > 0 && query.trim().length < 2;

    const handleClick = (
      event: MouseEvent,
      item: DropdownItem,
    ) => {
      event.preventDefault();
      onSelect(item);
    };

    const optionId = (index: number) => `${id}-option-${index}`;

    return (
      <div
        ref={ref}
        id={id}
        role="listbox"
        aria-label="Search suggestions"
        className="animate-fade-in mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white shadow-[var(--shadow-luxury-lg)]"
      >
        {error ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
          </div>
        ) : null}

        {!error && status === "loading" ? (
          <div className="px-6 py-8 text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-faint)]">
              Searching…
            </p>
          </div>
        ) : null}

        {!error && status === "ready" && items.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="eyebrow">No matches</p>
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              Nothing found for <span className="text-[var(--color-ink-soft)]">&ldquo;{query}&rdquo;</span>.
            </p>
            <p className="mt-1 text-xs text-[var(--color-faint)]">
              Press Enter to see the full search results page.
            </p>
          </div>
        ) : null}

        {!error && status === "ready" && (products.length || categories.length) ? (
          <div className="grid divide-y divide-[var(--color-line-soft)] md:grid-cols-[1.4fr_1fr] md:divide-x md:divide-y-0">
            <section className="py-2">
              {products.length ? (
                <>
                  <SectionLabel>Products</SectionLabel>
                  <ul>
                    {products.map((product) => {
                      const globalIndex = items.findIndex(
                        (item) =>
                          item.kind === "product" &&
                          item.hit.id === product.id,
                      );
                      const isActive = globalIndex === activeIndex;
                      return (
                        <li key={product.id} role="presentation">
                          <Link
                            id={optionId(globalIndex)}
                            href={`/product/${product.slug}`}
                            role="option"
                            aria-selected={isActive}
                            onMouseEnter={() => onHover(globalIndex)}
                            onClick={(event) =>
                              handleClick(event, items[globalIndex])
                            }
                            className={`flex items-center gap-4 px-5 py-3 transition ${
                              isActive
                                ? "bg-[#f8f8f8]"
                                : "hover:bg-[#f8f8f8]"
                            }`}
                          >
                            <div className="relative h-14 w-12 shrink-0 overflow-hidden bg-[var(--color-bg-warm)]">
                              {product.image?.sourceUrl ? (
                                <Image
                                  src={product.image.sourceUrl}
                                  alt={product.image.altText || product.name}
                                  fill
                                  unoptimized
                                  sizes="48px"
                                  className="object-cover"
                                />
                              ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm text-[var(--color-ink-soft)]">
                                {highlightMatch(product.name, query)}
                              </p>
                              {product.category ? (
                                <p className="mt-0.5 truncate text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">
                                  {product.category.name}
                                </p>
                              ) : null}
                            </div>
                            {product.price ? (
                              <span className="price text-sm tabular-nums">
                                {formatPriceText(product.price)}
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <EmptySection label="Products" message="No products matched." />
              )}
            </section>

            <section className="py-2">
              {categories.length ? (
                <>
                  <SectionLabel>Categories</SectionLabel>
                  <ul>
                    {categories.map((category) => {
                      const globalIndex = items.findIndex(
                        (item) =>
                          item.kind === "category" &&
                          item.hit.id === category.id,
                      );
                      const isActive = globalIndex === activeIndex;
                      return (
                        <li key={category.id} role="presentation">
                          <Link
                            id={optionId(globalIndex)}
                            href={`/shop?category=${category.slug}`}
                            role="option"
                            aria-selected={isActive}
                            onMouseEnter={() => onHover(globalIndex)}
                            onClick={(event) =>
                              handleClick(event, items[globalIndex])
                            }
                            className={`flex items-center gap-3 px-5 py-3 transition ${
                              isActive
                                ? "bg-[#f8f8f8]"
                                : "hover:bg-[#f8f8f8]"
                            }`}
                          >
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-bg-warm)] text-[var(--color-faint)]">
                              <FolderIcon />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm text-[var(--color-ink-soft)]">
                                {highlightMatch(category.name, query)}
                              </p>
                              {category.count != null ? (
                                <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">
                                  {category.count}{" "}
                                  {category.count === 1 ? "piece" : "pieces"}
                                </p>
                              ) : null}
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <EmptySection label="Categories" message="No categories matched." />
              )}
            </section>
          </div>
        ) : null}

        {!error && (status === "trending" || status === "idle") && isEmptyQuery ? (
          <div className="grid divide-y divide-[var(--color-line-soft)] md:grid-cols-[1.4fr_1fr] md:divide-x md:divide-y-0">
            <section className="py-2">
              <SectionLabel>Trending Searches</SectionLabel>
              {trendingCategories.length ? (
                <ul>
                  {trendingCategories.slice(0, 5).map((category, position) => {
                    const globalIndex = items.findIndex(
                      (item) =>
                        item.kind === "term" && item.label === category.name,
                    );
                    const isActive = globalIndex === activeIndex;
                    return (
                      <li key={`trend-${category.id}`} role="presentation">
                        <Link
                          id={optionId(globalIndex)}
                          href={`/search?q=${encodeURIComponent(category.name)}`}
                          role="option"
                          aria-selected={isActive}
                          onMouseEnter={() => onHover(globalIndex)}
                          onClick={(event) =>
                            handleClick(event, items[globalIndex])
                          }
                          className={`flex items-center gap-3 px-5 py-3 text-sm transition ${
                            isActive
                              ? "bg-[#f8f8f8]"
                              : "hover:bg-[#f8f8f8]"
                          }`}
                        >
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-warm)] text-[var(--color-faint)]">
                            <TrendIcon />
                          </span>
                          <span className="text-[var(--color-ink-soft)]">
                            {category.name}
                          </span>
                          <span className="ml-auto text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">
                            #{position + 1}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="px-5 pb-3 text-sm text-[var(--color-faint)]">
                  Trending searches will appear once the catalog has activity.
                </p>
              )}
            </section>

            <section className="py-2">
              <SectionLabel>Popular Categories</SectionLabel>
              {trendingCategories.length ? (
                <ul>
                  {trendingCategories.slice(0, 5).map((category) => {
                    const globalIndex = items.findIndex(
                      (item) =>
                        item.kind === "category" &&
                        item.hit.id === category.id,
                    );
                    const isActive = globalIndex === activeIndex;
                    return (
                      <li key={`pop-${category.id}`} role="presentation">
                        <Link
                          id={optionId(globalIndex)}
                          href={`/shop?category=${category.slug}`}
                          role="option"
                          aria-selected={isActive}
                          onMouseEnter={() => onHover(globalIndex)}
                          onClick={(event) =>
                            handleClick(event, items[globalIndex])
                          }
                          className={`flex items-center gap-3 px-5 py-3 text-sm transition ${
                            isActive
                              ? "bg-[#f8f8f8]"
                              : "hover:bg-[#f8f8f8]"
                          }`}
                        >
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-warm)] text-[var(--color-faint)]">
                            <FolderIcon />
                          </span>
                          <span className="text-[var(--color-ink-soft)]">
                            {category.name}
                          </span>
                          {category.count != null ? (
                            <span className="ml-auto text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">
                              {category.count}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="px-5 pb-3 text-sm text-[var(--color-faint)]">
                  Categories will appear once they are published in WooCommerce.
                </p>
              )}
            </section>
          </div>
        ) : null}

        {!error && isShortQuery ? (
          <div className="px-6 py-8 text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-faint)]">
              Keep typing…
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Enter at least 2 characters to search the catalog.
            </p>
          </div>
        ) : null}

        {query.trim().length >= 2 ? (
          <div className="border-t border-[var(--color-line-soft)] bg-[var(--color-bg)] px-5 py-3 text-center text-xs uppercase tracking-[0.22em] text-[var(--color-faint)]">
            Press <kbd className="mx-1 rounded border border-[var(--color-line)] bg-white px-1.5 py-0.5 text-[10px] text-[var(--color-ink-soft)]">Enter</kbd>{" "}
            for all results
          </div>
        ) : null}
      </div>
    );
  },
);

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-5 pb-2 pt-3 text-[0.62rem] uppercase tracking-[0.28em] text-[var(--color-faint)]">
      {children}
    </p>
  );
}

function EmptySection({
  label,
  message,
}: {
  label: string;
  message: string;
}) {
  return (
    <div className="px-5 py-4">
      <SectionLabel>{label}</SectionLabel>
      <p className="px-0 text-sm text-[var(--color-faint)]">{message}</p>
    </div>
  );
}

export default SearchDropdown;
