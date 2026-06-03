import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import AccountSidebar from "@/components/account/AccountSidebar";
import { getActiveSession } from "@/lib/auth-server";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const result = await getActiveSession();

  if (result.status === "missing") {
    redirect("/login?redirect=/account");
  }

  if (result.status === "refresh-required") {
    // Cookie writes aren't allowed inside Server Components in Next.js 16.
    // Bounce through a route handler that rotates the JWT and returns here.
    redirect("/api/auth/refresh?return=/account");
  }

  if (result.status === "invalid") {
    // No refresh token available and the JWT was rejected — clear the cookie
    // via the logout route handler, then send the user back to /login.
    redirect("/api/auth/logout?return=/account");
  }

  const session = result.session;

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="container-app py-10 lg:py-16">
        <header className="border-b border-[var(--color-line)] pb-8 lg:pb-10">
          <p className="eyebrow">Account</p>
          <h1 className="display-2 mt-3">Your dashboard</h1>
        </header>
        <div className="grid gap-10 pt-10 lg:grid-cols-[240px_1fr] lg:gap-14">
          <AccountSidebar user={session.user} />
          <div>{children}</div>
        </div>
      </div>
    </main>
  );
}
