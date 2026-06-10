"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import CartDrawer from "@/components/layout/CartDrawer";
import SearchBar from "@/components/search/SearchBar";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useSignOut } from "@/hooks/useSignOut";
import type { ProductCategory } from "@/lib/graphql";
import { siteConfig } from "@/lib/site-config";

type HeaderClientProps = {
  categories: ProductCategory[];
};

function Icon({
  path,
  className = "h-5 w-5",
  stroke = 1.4,
}: {
  path: string;
  className?: string;
  stroke?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  search: "m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6L6 18",
  account:
    "M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0",
  heart:
    "M12 21s-7.5-4.6-7.5-10.5A4.5 4.5 0 0 1 12 6.5a4.5 4.5 0 0 1 7.5 4c0 5.9-7.5 10.5-7.5 10.5Z",
  chevronDown: "M6 9l6 6 6-6",
  chevronUp: "M6 15l6-6 6 6",
};

export default function HeaderClient({ categories }: HeaderClientProps) {
  const pathname = usePathname();
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);

  const { items } = useCart();
  const cartQuantity = items.reduce((total, item) => total + item.quantity, 0);
  const { user, isAuthenticated, isReady } = useAuth();
  const signOut = useSignOut();

  const featuredCategory = useMemo(
    () => categories.find((category) => category.image?.sourceUrl) ?? categories[0],
    [categories],
  );
  const primaryCategories = useMemo(() => categories.slice(0, 5), [categories]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 4);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setAccountOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!accountOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [accountOpen]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setAccountOpen(false);
        setMegaOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen || cartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, cartOpen]);

  const displayName = user?.firstName || user?.displayName || user?.email?.split("@")[0];

  return (
    <>
      <header
        className={`luxury-header transition-shadow ${
          scrolled ? "shadow-[0_8px_32px_rgba(15,12,10,0.48)]" : ""
        }`}
      >
        <div className="luxury-header__strip px-4 py-2 text-center text-[0.68rem] uppercase tracking-[0.24em]">
          Complimentary worldwide delivery on orders over ₹25,000
        </div>

        <div className="luxury-header__bar container-app grid h-[72px] grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center gap-2 justify-self-start lg:gap-4">
            <button
              type="button"
              className="luxury-header__icon-btn -ml-2 inline-flex h-10 w-10 items-center justify-center lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Icon path={ICONS.menu} className="h-6 w-6" stroke={1.3} />
            </button>
            <button
              type="button"
              className="luxury-header__icon-btn hidden h-10 w-10 items-center justify-center lg:inline-flex"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Icon path={ICONS.search} stroke={1.4} />
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="luxury-header__link hidden text-[0.72rem] uppercase tracking-[0.2em] lg:inline"
            >
              Search
            </button>
          </div>

          <Link
            href="/"
            className="luxury-header__logo justify-self-center font-serif text-[1.4rem] font-light uppercase tracking-[0.46em] md:text-[1.65rem]"
          >
            {siteConfig.brandName}
          </Link>

          <div className="flex items-center gap-1 justify-self-end md:gap-2">
            <Link
              href="/editorial"
              className="luxury-header__link hidden px-3 text-[0.72rem] uppercase tracking-[0.2em] xl:inline"
            >
              Editorial
            </Link>
            <Link
              href="/contact"
              className="luxury-header__link hidden px-3 text-[0.72rem] uppercase tracking-[0.2em] xl:inline"
            >
              Contact
            </Link>

            <div ref={accountRef} className="relative hidden md:block">
              <button
                type="button"
                className="luxury-header__icon-btn inline-flex h-10 w-10 items-center justify-center"
                onClick={() => setAccountOpen((current) => !current)}
                aria-label="Account"
                aria-expanded={accountOpen}
              >
                <Icon path={ICONS.account} stroke={1.3} />
              </button>
              {accountOpen ? (
                <div className="animate-fade-in absolute right-0 top-full mt-2 w-72 border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-luxury)]">
                  {!isReady ? (
                    <div className="space-y-3">
                      <div className="skeleton h-4 w-32" />
                      <div className="skeleton h-4 w-48" />
                    </div>
                  ) : isAuthenticated ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[var(--color-faint)]">
                          Signed in as
                        </p>
                        <p className="text-break-safe mt-1 font-serif text-lg text-[var(--color-ink-soft)]">
                          {displayName}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Link
                          href="/account"
                          className="block border-b border-[var(--color-line-soft)] py-2 text-sm uppercase tracking-[0.16em] hover:text-[var(--color-faint)]"
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/account/orders"
                          className="block border-b border-[var(--color-line-soft)] py-2 text-sm uppercase tracking-[0.16em] hover:text-[var(--color-faint)]"
                        >
                          Orders
                        </Link>
                        <Link
                          href="/account/profile"
                          className="block border-b border-[var(--color-line-soft)] py-2 text-sm uppercase tracking-[0.16em] hover:text-[var(--color-faint)]"
                        >
                          Profile
                        </Link>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          signOut();
                          setAccountOpen(false);
                        }}
                        className="btn btn-secondary w-full"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[var(--color-faint)]">
                        Welcome
                      </p>
                      <p className="font-serif text-xl text-[var(--color-ink-soft)]">
                        Sign in to your account
                      </p>
                      <Link
                        href="/login"
                        className="btn btn-primary w-full"
                        onClick={() => setAccountOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        className="btn btn-secondary w-full"
                        onClick={() => setAccountOpen(false)}
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              className="luxury-header__icon-btn relative inline-flex h-10 w-10 items-center justify-center"
              onClick={() => setCartOpen(true)}
              aria-label={`Cart, ${cartQuantity} ${cartQuantity === 1 ? "item" : "items"}`}
            >
              <ShoppingBag size={20} strokeWidth={1.5} aria-hidden="true" />
              {cartQuantity > 0 ? (
                <span className="luxury-header__cart-badge absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-semibold">
                  {cartQuantity}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        <nav
          className="luxury-header__nav relative hidden lg:block"
          onMouseLeave={() => setMegaOpen(false)}
          aria-label="Primary"
        >
          <div className="container-app flex justify-center gap-10">
            <Link
              href="/shop"
              onMouseEnter={() => setMegaOpen(true)}
              className="luxury-header__link py-4 text-[0.72rem] uppercase tracking-[0.22em]"
            >
              Shop All
            </Link>
            {primaryCategories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                onMouseEnter={() => setMegaOpen(true)}
                className="luxury-header__link py-4 text-[0.72rem] uppercase tracking-[0.22em]"
              >
                {category.name}
              </Link>
            ))}
            <Link
              href="/about"
              className="luxury-header__link py-4 text-[0.72rem] uppercase tracking-[0.2em]"
            >
              About
            </Link>
          </div>

          {megaOpen && categories.length ? (
            <div className="animate-mega-enter absolute inset-x-0 top-full border-y border-[var(--color-line)] bg-white shadow-[var(--shadow-luxury)]">
              <div className="mx-auto flex w-full max-w-[1080px] flex-wrap justify-center gap-x-12 gap-y-8 px-6 py-8 lg:flex-nowrap lg:items-start lg:gap-x-14 lg:px-10">
                <div className="w-full lg:w-[240px] lg:shrink-0">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-faint)] mb-4">
                    Shop by Category
                  </p>
                  <ul className="space-y-0.5">
                    {categories.map((category) => (
                      <li key={category.id}>
                        <Link
                          href={`/shop?category=${category.slug}`}
                          className="flex items-center justify-between rounded-sm border-b border-[var(--color-line-soft)] px-2 py-1.5 text-[14px] tracking-[0.02em] text-[var(--color-ink-soft)] transition-colors duration-200 hover:bg-[rgba(0,0,0,0.03)] hover:text-[var(--color-ink-soft)]"
                        >
                          <span>{category.name}</span>
                          <span className="text-[11px] text-[var(--color-faint)]">
                            {category.count ?? 0}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {featuredCategory ? (
                  <div className="w-full lg:w-[260px] lg:shrink-0">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-faint)] mb-4">
                      Featured Collection
                    </p>
                    <Link
                      href={`/shop?category=${featuredCategory.slug}`}
                      className="group block transition-transform duration-300 ease-out hover:-translate-y-1"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-bg-warm)]">
                        {featuredCategory.image?.sourceUrl ? (
                          <Image
                            src={featuredCategory.image.sourceUrl}
                            alt={
                              featuredCategory.image.altText || featuredCategory.name
                            }
                            fill
                            unoptimized
                            sizes="260px"
                            className="object-cover transition duration-700 group-hover:scale-[1.04]"
                          />
                        ) : null}
                      </div>
                      <p className="mt-3 text-[13px] uppercase tracking-[0.2em]">
                        {featuredCategory.name}
                      </p>
                    </Link>
                  </div>
                ) : null}

                <div className="w-full bg-[var(--color-bg-soft)] p-6 lg:w-[280px] lg:shrink-0">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-faint)]">
                    New Arrivals
                  </p>
                  <h3 className="mt-3 font-serif text-[22px] font-light leading-snug tracking-[-0.02em]">
                    A quiet luxury, refined daily.
                  </h3>
                  <p className="mt-3 text-[13px] leading-6 text-[var(--color-muted)]">
                    Pieces sourced and curated to outlast trend cycles.
                  </p>
                  <Link
                    href="/shop"
                    className="mt-5 inline-block border-b border-[var(--color-ink-soft)] pb-1 text-[11px] uppercase tracking-[0.22em] transition-colors duration-200 hover:text-[var(--color-faint)]"
                  >
                    View All Products
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </nav>
      </header>

      <SearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />

      {mobileOpen ? (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative ml-auto flex h-full w-[88%] max-w-[420px] flex-col bg-[var(--color-bg)] animate-slide-in-right">
            <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4">
              <span className="font-serif text-xl uppercase tracking-[0.36em]">
                {siteConfig.brandName}
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center"
                aria-label="Close menu"
              >
                <Icon path={ICONS.close} className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setSearchOpen(true);
                }}
                className="mb-6 flex w-full items-center gap-3 border border-[var(--color-line)] bg-white px-4 py-3 text-sm text-[var(--color-faint)]"
              >
                <Icon path={ICONS.search} className="h-4 w-4" />
                Search
              </button>

              <Link
                href="/shop"
                className="flex items-center justify-between border-b border-[var(--color-line-soft)] py-4 text-sm uppercase tracking-[0.2em]"
              >
                Shop All
              </Link>

              <button
                type="button"
                onClick={() =>
                  setMobileExpanded((current) =>
                    current === "categories" ? null : "categories",
                  )
                }
                className="flex w-full items-center justify-between border-b border-[var(--color-line-soft)] py-4 text-sm uppercase tracking-[0.2em]"
              >
                Categories
                <Icon
                  path={
                    mobileExpanded === "categories" ? ICONS.chevronUp : ICONS.chevronDown
                  }
                  className="h-4 w-4"
                  stroke={1.6}
                />
              </button>
              {mobileExpanded === "categories" ? (
                <div className="border-b border-[var(--color-line-soft)] py-3">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/shop?category=${category.slug}`}
                      className="flex items-center justify-between py-2.5 text-sm text-[var(--color-muted)]"
                    >
                      <span>{category.name}</span>
                      <span className="text-xs text-[var(--color-faint)]">
                        {category.count ?? 0}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : null}

              <Link
                href="/editorial"
                className="flex items-center justify-between border-b border-[var(--color-line-soft)] py-4 text-sm uppercase tracking-[0.2em]"
              >
                Editorial
              </Link>
              <Link
                href="/about"
                className="flex items-center justify-between border-b border-[var(--color-line-soft)] py-4 text-sm uppercase tracking-[0.2em]"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="flex items-center justify-between border-b border-[var(--color-line-soft)] py-4 text-sm uppercase tracking-[0.2em]"
              >
                Contact
              </Link>
            </div>

            <div className="border-t border-[var(--color-line)] px-5 py-5">
              {isAuthenticated && user ? (
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-faint)]">
                    Signed in
                  </p>
                  <p className="font-serif text-lg">{displayName}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/account" className="btn btn-secondary w-full">
                      Account
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        signOut();
                        setMobileOpen(false);
                      }}
                      className="btn btn-primary w-full"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link href="/login" className="btn btn-primary w-full">
                    Sign In
                  </Link>
                  <Link href="/register" className="btn btn-secondary w-full">
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      ) : null}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
