"use client";

import { useMemo, useState } from "react";

import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { formatPriceText } from "@/lib/format";
import type { Product } from "@/lib/graphql";

export default function ProductPurchasePanel({ product }: { product: Product }) {
  const { addToCart, checkoutAction } = useCart();
  const { notify } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const variations = product.variations?.nodes ?? [];
  const [selectedVariationId, setSelectedVariationId] = useState<string>(
    variations[0]?.id ?? "",
  );

  const selectedVariation = useMemo(
    () => variations.find((variation) => variation.id === selectedVariationId),
    [selectedVariationId, variations],
  );

  const purchasable = selectedVariation ?? product;
  const priceHtml = purchasable.price ?? product.price ?? "";
  const regular = purchasable.regularPrice ?? product.regularPrice;
  const sale = purchasable.salePrice ?? product.salePrice;
  const isOnSale = Boolean(sale && regular && sale !== regular);

  const handleAdd = async () => {
    setAdding(true);
    try {
      addToCart({
        databaseId: purchasable.databaseId,
        name: purchasable.name,
        price: priceHtml,
        image: product.image?.sourceUrl ?? null,
        slug: product.slug,
        categoryName: product.productCategories?.nodes[0]?.name,
        quantity,
      });
      notify(`${purchasable.name} added to your bag.`, "success");
    } finally {
      setTimeout(() => setAdding(false), 400);
    }
  };

  const handleBuyNow = async () => {
    await handleAdd();
    checkoutAction();
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-baseline gap-3">
          {isOnSale && regular ? (
            <>
              <span className="text-xl line-through text-[var(--color-faint)]">
                {formatPriceText(regular)}
              </span>
              <span className="price text-2xl font-medium">
                {formatPriceText(sale)}
              </span>
              <span className="inline-flex items-center bg-[var(--color-ink-soft)] px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.18em] text-white">
                On sale
              </span>
            </>
          ) : (
            <span className="price text-2xl font-medium">
              {formatPriceText(priceHtml) || "Price on request"}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-[var(--color-faint)]">
          Taxes and shipping calculated at checkout.
        </p>
      </div>

      {variations.length ? (
        <label className="block">
          <span className="label">Variation</span>
          <select
            value={selectedVariationId}
            onChange={(event) => setSelectedVariationId(event.target.value)}
            className="input"
          >
            {variations.map((variation) => (
              <option key={variation.id} value={variation.id}>
                {variation.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <div className="flex flex-wrap items-stretch gap-3">
        <div className="flex h-12 items-center border border-[var(--color-line)] bg-white">
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            className="h-full px-4 text-lg text-[var(--color-faint)] transition hover:text-[var(--color-ink-soft)]"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="min-w-10 text-center text-sm font-medium">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.min(99, current + 1))}
            className="h-full px-4 text-lg text-[var(--color-faint)] transition hover:text-[var(--color-ink-soft)]"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={adding}
          className="btn btn-primary flex-1"
        >
          {adding ? "Adding…" : "Add to Bag"}
        </button>
      </div>

      <button
        type="button"
        onClick={handleBuyNow}
        className="btn btn-secondary w-full"
      >
        Buy It Now
      </button>

      <ul className="space-y-3 border-t border-[var(--color-line)] pt-5 text-xs text-[var(--color-muted)]">
        <li className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
          Complimentary signature packaging
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
          Insured worldwide delivery
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
          14-day exchanges &amp; concierge support
        </li>
      </ul>
    </div>
  );
}
