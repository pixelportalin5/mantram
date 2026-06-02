"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import type { AuthUser } from "@/lib/auth-types";

const LINKS = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/profile", label: "Profile" },
];

type AccountSidebarProps = {
  user: AuthUser;
};

export default function AccountSidebar({ user }: AccountSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { notify } = useToast();
  const [signingOut, setSigningOut] = useState(false);

  const displayName =
    user.firstName || user.displayName || user.email?.split("@")[0];

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await logout();
      notify("You have been signed out.", "success");
      router.replace("/");
      router.refresh();
    } catch {
      notify("Could not sign out. Please try again.", "error");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <aside className="lg:sticky lg:top-32 lg:self-start">
      <div className="rounded-none border border-[var(--color-line)] bg-white p-6">
        <p className="eyebrow">Signed in as</p>
        <p className="mt-2 font-serif text-xl text-[var(--color-ink-soft)]">
          {displayName}
        </p>
        {user.email ? (
          <p className="mt-1 text-xs text-[var(--color-faint)]">{user.email}</p>
        ) : null}
      </div>

      <nav className="mt-6 space-y-1" aria-label="Account">
        {LINKS.map((link) => {
          const isActive =
            link.href === "/account"
              ? pathname === "/account"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between border-b border-[var(--color-line-soft)] py-3 text-sm uppercase tracking-[0.18em] transition ${
                isActive
                  ? "text-[var(--color-ink-soft)]"
                  : "text-[var(--color-faint)] hover:text-[var(--color-ink-soft)]"
              }`}
            >
              <span>{link.label}</span>
              <span aria-hidden="true">→</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={handleLogout}
          disabled={signingOut}
          className="mt-6 inline-flex w-full items-center justify-between border-b border-[var(--color-line-soft)] py-3 text-sm uppercase tracking-[0.18em] text-[var(--color-faint)] transition hover:text-[var(--color-danger)] disabled:opacity-50"
        >
          <span>{signingOut ? "Signing out…" : "Sign Out"}</span>
          <span aria-hidden="true">↗</span>
        </button>
      </nav>
    </aside>
  );
}
