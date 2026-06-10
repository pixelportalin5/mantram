import Image from "next/image";
import Link from "next/link";

import { fetchCustomer, readSession } from "@/lib/auth-server";
import { formatDate, formatPriceText } from "@/lib/format";

export const metadata = {
  title: "Orders",
};

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  // Layout already validated; read the cookie directly (no writes).
  const session = await readSession();
  if (!session) return null;

  const profile = await fetchCustomer(session.authToken);
  const orders = profile?.orders?.nodes ?? [];

  return (
    <div>
      <header className="mb-8">
        <p className="eyebrow">Account</p>
        <h2 className="display-3 mt-2">Order history</h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--color-muted)]">
          Every order you have placed with the house, with tracking, status, and
          itemised totals.
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="border border-[var(--color-line)] bg-white px-8 py-16 text-center">
          <p className="eyebrow">Empty</p>
          <h3 className="display-3 mt-4">No orders yet.</h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--color-muted)]">
            When you place your first order, you will find the details, status, and
            tracking information here.
          </p>
          <Link href="/shop" className="btn btn-primary mt-6 inline-flex">
            Start Browsing
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const lineItems = order.lineItems?.nodes ?? [];
            return (
              <article
                key={order.id}
                className="border border-[var(--color-line)] bg-white"
              >
                <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-line-soft)] px-5 py-4">
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[var(--color-faint)]">
                      Order
                    </p>
                    <p className="font-serif text-lg text-[var(--color-ink-soft)]">
                      #{order.orderNumber}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-6">
                    <div>
                      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-faint)]">
                        Placed
                      </p>
                      <p className="text-sm text-[var(--color-ink-soft)]">
                        {formatDate(order.date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-faint)]">
                        Status
                      </p>
                      <p className="text-sm capitalize text-[var(--color-ink-soft)]">
                        {order.status?.toLowerCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-faint)]">
                        Total
                      </p>
                      <p className="price text-sm">{formatPriceText(order.total)}</p>
                    </div>
                  </div>
                </header>

                {lineItems.length ? (
                  <ul className="divide-y divide-[var(--color-line-soft)]">
                    {lineItems.map((item, index) => {
                      const product = item.product?.node;
                      return (
                        <li
                          key={`${order.id}-${index}`}
                          className="flex items-center gap-4 px-5 py-4"
                        >
                          <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-[var(--color-bg-warm)]">
                            {product?.image?.sourceUrl ? (
                              <Image
                                src={product.image.sourceUrl}
                                alt={product.image.altText || product.name}
                                fill
                                unoptimized
                                sizes="56px"
                                className="object-cover"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            {product ? (
                              <Link
                                href={`/product/${product.slug}`}
                                className="text-sm font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-faint)]"
                              >
                                {product.name}
                              </Link>
                            ) : (
                              <p className="text-sm text-[var(--color-muted)]">
                                Unavailable product
                              </p>
                            )}
                            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--color-faint)]">
                              Quantity {item.quantity ?? 1}
                            </p>
                          </div>
                          <p className="price text-sm">{formatPriceText(item.total)}</p>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
