"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import CartLineItem from "@/components/cart/CartLineItem";
import OrderSummary from "@/components/cart/OrderSummary";
import ProductCard from "@/components/ui/ProductCard";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/graphql";

type CartPageContentProps = {
  recommendations: Product[];
};

export default function CartPageContent({ recommendations }: CartPageContentProps) {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, cartTotal } = useCart();

  const handleCheckout = () => {
    router.push("/checkout");
  };

  const cartProductIds = new Set(items.map((item) => item.databaseId));
  const suggested = recommendations
    .filter((product) => !cartProductIds.has(product.databaseId))
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="container-app py-12 lg:py-20">
        <header className="max-w-3xl">
          <p className="eyebrow">Your Selection</p>
          <h1 className="display-2 mt-4 text-[var(--color-ink-soft)]">
            Shopping Bag
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-[var(--color-muted)]">
            Review your selected pieces before checkout.
          </p>
        </header>

        {items.length === 0 ? (
          <div className="mt-16 border border-[var(--color-line)] bg-white px-8 py-20 text-center shadow-[var(--shadow-luxury-sm)] lg:mt-20 lg:px-16 lg:py-28">
            <p className="eyebrow">Shopping Bag</p>
            <h2 className="display-3 mt-6 text-[var(--color-ink-soft)]">
              Shopping Bag Empty
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-[var(--color-muted)]">
              You have not added any pieces yet.
            </p>
            <Link href="/shop" className="btn btn-primary mt-10">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:gap-16 xl:grid-cols-[7fr_3fr]">
            <section aria-label="Bag items">
              <ul>
                {items.map((item) => (
                  <li key={item.databaseId}>
                    <CartLineItem
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                      layout="page"
                    />
                  </li>
                ))}
              </ul>
            </section>

            <aside className="lg:sticky lg:top-32 lg:self-start">
              <OrderSummary
                subtotal={cartTotal}
                isCheckingOut={false}
                onCheckout={handleCheckout}
              />
            </aside>
          </div>
        )}

        {suggested.length ? (
          <section className="mt-20 border-t border-[var(--color-line)] pt-16 lg:mt-28 lg:pt-24">
            <div className="mb-10 text-center lg:mb-12">
              <p className="eyebrow">Curated for you</p>
              <h2 className="display-2 mt-3 text-[var(--color-ink-soft)]">
                You May Also Like
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {suggested.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
