"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import CartQuantityControl from "@/components/cart/CartQuantityControl";
import type { CartItem } from "@/context/CartContext";
import { formatPriceText } from "@/lib/format";
import { isUsableProductImageUrl } from "@/lib/strings";

type CartLineItemProps = {
  item: CartItem;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
  layout?: "page" | "drawer";
};

export default function CartLineItem({
  item,
  onUpdateQuantity,
  onRemove,
  layout = "page",
}: CartLineItemProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const imageUrl = isUsableProductImageUrl(item.image) ? item.image : null;
  const productHref = item.slug ? `/product/${item.slug}` : null;

  const handleRemove = () => {
    setIsRemoving(true);
    window.setTimeout(() => onRemove(item.databaseId), 280);
  };

  const imageSizes =
    layout === "drawer"
      ? "80px"
      : "(min-width: 1024px) 160px, 120px";

  const imageBoxClass =
    layout === "drawer"
      ? "relative h-24 w-20 shrink-0 overflow-hidden bg-[var(--color-bg-warm)]"
      : "relative h-32 w-28 shrink-0 overflow-hidden bg-[var(--color-bg-warm)] sm:h-36 sm:w-32";

  return (
    <article
      className={`transition-all duration-300 ease-out ${
        isRemoving ? "pointer-events-none opacity-0 translate-x-2" : "opacity-100"
      }`}
    >
      <div
        className={`flex gap-5 ${
          layout === "page" ? "border-b border-[var(--color-line-soft)] py-8" : ""
        }`}
      >
        {productHref ? (
          <Link href={productHref} className={imageBoxClass}>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={item.name}
                fill
                unoptimized
                sizes={imageSizes}
                className="object-cover transition-transform duration-500 hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-2 text-center text-[0.6rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">
                {item.name}
              </div>
            )}
          </Link>
        ) : (
          <div className={imageBoxClass}>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={item.name}
                fill
                unoptimized
                sizes={imageSizes}
                className="object-cover"
              />
            ) : null}
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
          <div>
            {item.categoryName ? (
              <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--color-faint)]">
                {item.categoryName}
              </p>
            ) : null}
            {productHref ? (
              <Link
                href={productHref}
                className={`mt-1 block leading-snug text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-faint)] ${
                  layout === "drawer"
                    ? "text-sm font-medium"
                    : "font-serif text-xl font-light"
                }`}
              >
                {item.name}
              </Link>
            ) : (
              <h3
                className={`mt-1 leading-snug text-[var(--color-ink-soft)] ${
                  layout === "drawer"
                    ? "text-sm font-medium"
                    : "font-serif text-xl font-light"
                }`}
              >
                {item.name}
              </h3>
            )}
            <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
              {formatPriceText(item.price)}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <CartQuantityControl
              quantity={item.quantity}
              onChange={(qty) => onUpdateQuantity(item.databaseId, qty)}
              size={layout === "drawer" ? "sm" : "md"}
            />
            <button
              type="button"
              onClick={handleRemove}
              className="text-[0.68rem] uppercase tracking-[0.2em] text-[var(--color-danger)] transition-colors hover:text-[#8f1f24]"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
