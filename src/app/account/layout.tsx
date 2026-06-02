import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import AccountSidebar from "@/components/account/AccountSidebar";
import { requireSession } from "@/lib/auth-server";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();

  if (!session) {
    redirect("/login?redirect=/account");
  }

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
