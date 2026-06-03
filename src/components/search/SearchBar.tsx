"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import SearchDropdown, {
  type DropdownItem,
} from "@/components/search/SearchDropdown";
import { useSearch } from "@/hooks/useSearch";

type SearchBarProps = {
  open: boolean;
  onClose: () => void;
};

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export default function SearchBar({ open, onClose }: SearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const reactId = useId();
  const listboxId = `${reactId}-listbox`;

  const {
    query,
    setQuery,
    reset,
    status,
    products,
    categories,
    trendingCategories,
    error,
  } = useSearch(open);

  const [activeIndex, setActiveIndex] = useState(-1);

  const items: DropdownItem[] = useMemo(() => {
    const list: DropdownItem[] = [];

    if (query.trim().length >= 2) {
      for (const product of products) {
        list.push({
          kind: "product",
          href: `/product/${product.slug}`,
          hit: product,
        });
      }
      for (const category of categories) {
        list.push({
          kind: "category",
          href: `/shop?category=${category.slug}`,
          hit: category,
        });
      }
    } else if (query.trim().length === 0 && trendingCategories.length) {
      const seen = new Set<string>();
      for (const category of trendingCategories.slice(0, 5)) {
        list.push({
          kind: "term",
          href: `/search?q=${encodeURIComponent(category.name)}`,
          label: category.name,
        });
        seen.add(category.id);
      }
      for (const category of trendingCategories.slice(0, 5)) {
        list.push({
          kind: "category",
          href: `/shop?category=${category.slug}`,
          hit: category,
        });
      }
    }

    return list;
  }, [query, products, categories, trendingCategories]);

  // Reset highlight whenever the option list changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [items.length]);

  // Focus the input + clear state whenever the overlay opens
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(timer);
  }, [open]);

  // ESC closes; outside click closes
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    const handlePointer = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(event.target as Node)) return;
      onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointer);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointer);
    };
  }, [open, onClose]);

  // Body scroll lock while open
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const navigateTo = useCallback(
    (item: DropdownItem | null) => {
      if (!item) return;
      onClose();
      reset();
      router.push(item.href);
    },
    [onClose, reset, router],
  );

  const submitFullSearch = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;
      onClose();
      reset();
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [onClose, reset, router],
  );

  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (items.length === 0) return;
      setActiveIndex((current) => (current + 1) % items.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (items.length === 0) return;
      setActiveIndex((current) =>
        current <= 0 ? items.length - 1 : current - 1,
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0 && activeIndex < items.length) {
        navigateTo(items[activeIndex]);
        return;
      }
      submitFullSearch(query);
      return;
    }

    if (event.key === "Tab") {
      onClose();
    }
  };

  if (!open) return null;

  const activeOptionId =
    activeIndex >= 0 && activeIndex < items.length
      ? `${listboxId}-option-${activeIndex}`
      : undefined;

  return (
    <div className="fixed inset-0 z-[70]">
      <div
        className="absolute inset-0 bg-black/45 animate-fade-in"
        aria-hidden="true"
      />
      <div
        ref={containerRef}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded="true"
        aria-controls={listboxId}
        aria-owns={listboxId}
        className="relative w-full bg-[var(--color-bg)] animate-fade-in-up"
      >
        <div className="container-app pt-6 pb-4 md:pt-8 md:pb-6">
          <div className="mx-auto flex w-full max-w-3xl items-center gap-3 border-b border-[var(--color-line)] py-3">
            <SearchIcon />
            <input
              ref={inputRef}
              type="search"
              role="searchbox"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKey}
              placeholder="Search products, categories, or editorial"
              aria-label="Search the catalog"
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-activedescendant={activeOptionId}
              className="flex-1 bg-transparent text-base outline-none placeholder:text-[var(--color-faint)] md:text-lg"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  reset();
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="text-xs uppercase tracking-[0.18em] text-[var(--color-faint)] hover:text-[var(--color-ink-soft)]"
              >
                Clear
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="inline-flex h-9 w-9 items-center justify-center"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="container-app pb-10">
          <SearchDropdown
            ref={dropdownRef}
            id={listboxId}
            query={query}
            status={status}
            products={products}
            categories={categories}
            trendingCategories={trendingCategories}
            error={error}
            items={items}
            activeIndex={activeIndex}
            onSelect={navigateTo}
            onHover={(index) => setActiveIndex(index)}
          />
        </div>
      </div>
    </div>
  );
}
