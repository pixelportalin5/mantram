import Link from "next/link";

import { fetchCustomer, readSession } from "@/lib/auth-server";
import { formatDate, formatPriceText } from "@/lib/format";

export const metadata = {
  title: "Account",
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  // The account layout has already validated the session via getActiveSession;
  // here we only need the raw cookie payload (read-only, no writes).
  const session = await readSession();
  if (!session) return null;

  const profile = await fetchCustomer(session.authToken);
  const orders = profile?.orders?.nodes ?? [];
  const recentOrders = orders.slice(0, 3);
  const billingCity = profile?.billing?.city || profile?.shipping?.city || null;
  const user = session.user;

  return (
    <div className="space-y-10">
      <section>
        <p className="eyebrow">Welcome back</p>
        <h2 className="display-3 mt-3">
          Hello, {user.firstName || user.displayName || user.email?.split("@")[0]}.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
          Manage your orders, saved details, and personal information from this
          dashboard. Reach out to concierge any time for assistance with sizing,
          gifting, or aftercare.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Account"
          value={user.email ?? "—"}
          hint={billingCity ? `Based in ${billingCity}` : "Manage your profile"}
        />
        <Stat
          label="Orders"
          value={String(orders.length)}
          hint="All-time orders"
        />
        <Stat label="Status" value="Active" hint="Member of the house" />
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-[0.72rem] uppercase tracking-[0.22em] text-[var(--color-ink-soft)]">
            Recent Orders
          </h3>
          <Link
            href="/account/orders"
            className="text-xs uppercase tracking-[0.18em] text-[var(--color-faint)] hover:text-[var(--color-ink-soft)]"
          >
            View all
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="border border-[var(--color-line)] bg-white px-6 py-10 text-center">
            <p className="text-sm text-[var(--color-muted)]">No orders yet.</p>
            <Link href="/shop" className="btn btn-secondary mt-5 inline-flex">
              Start Browsing
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-line-soft)] border border-[var(--color-line)] bg-white">
            {recentOrders.map((order) => (
              <li
                key={order.id}
                className="grid items-center gap-3 px-5 py-4 sm:grid-cols-[120px_1fr_auto]"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-faint)]">
                    Order #{order.orderNumber}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    {formatDate(order.date)}
                  </p>
                </div>
                <p className="text-sm text-[var(--color-ink-soft)]">
                  {order.lineItems?.nodes?.length ?? 0} item(s)
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-xs uppercase tracking-[0.16em] text-[var(--color-faint)]">
                    {order.status?.toLowerCase()}
                  </span>
                  <span className="price text-sm">
                    {formatPriceText(order.total)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="border border-[var(--color-line)] bg-white p-5">
      <p className="text-[0.65rem] uppercase tracking-[0.22em] text-[var(--color-faint)]">
        {label}
      </p>
      <p className="mt-2 font-serif text-2xl text-[var(--color-ink-soft)]">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-[var(--color-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}
