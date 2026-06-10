"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { formatPriceText } from "@/lib/format";
import type { Product } from "@/lib/graphql";
import { isUsableProductImageUrl } from "@/lib/strings";

type ProductCardProps = {
  product: Product;
  variant?: "default" | "compact";
};

export default function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const { addToCart } = useCart();
  const { notify } = useToast();
  const [primaryFailed, setPrimaryFailed] = useState(false);
  const [secondaryFailed, setSecondaryFailed] = useState(false);

  const primaryImage = isUsableProductImageUrl(product.image?.sourceUrl)
    ? product.image?.sourceUrl
    : null;

  const secondaryImage = useMemo(() => {
    const gallery = product.galleryImages?.nodes ?? [];
    const candidate = gallery.find(
      (image) =>
        isUsableProductImageUrl(image.sourceUrl) &&
        image.sourceUrl !== primaryImage,
    );
    return candidate?.sourceUrl ?? null;
  }, [primaryImage, product.galleryImages?.nodes]);

  const showHoverSwap = Boolean(secondaryImage) && !secondaryFailed;

  const imageAlt = product.image?.altText || product.name;
  const canRenderImage = Boolean(primaryImage) && !primaryFailed;
  const categoryName = product.productCategories?.nodes[0]?.name;
  const isOnSale = Boolean(
    product.salePrice && product.regularPrice && product.salePrice !== product.regularPrice,
  );

  const handleAdd = () => {
    addToCart({
      databaseId: product.databaseId,
      name: product.name,
      price: product.price ?? "",
      image: primaryImage ?? null,
      slug: product.slug,
      categoryName: product.productCategories?.nodes[0]?.name,
    });
    notify(`${product.name} added to your bag.`, "success");
  };

  return (
    <article className="group flex h-full flex-col">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-bg-warm)]">
          {canRenderImage ? (
            <>
              <Image
                src={primaryImage as string}
                alt={imageAlt}
                fill
                sizes="(min-width: 1280px) 320px, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className={`object-cover transition-all duration-700 ease-out ${
                  showHoverSwap ? "group-hover:opacity-0" : "group-hover:scale-[1.04]"
                }`}
                unoptimized
                onError={() => setPrimaryFailed(true)}
              />
              {secondaryImage && !secondaryFailed ? (
                <Image
                  src={secondaryImage}
                  alt={imageAlt}
                  fill
                  sizes="(min-width: 1280px) 320px, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="absolute inset-0 object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                  unoptimized
                  onError={() => setSecondaryFailed(true)}
                />
              ) : null}
            </>
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center">
              <span className="text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-faint)]">
                {product.name}
              </span>
            </div>
          )}

          {isOnSale ? (
            <span className="absolute left-3 top-3 inline-flex items-center bg-[var(--color-ink-soft)] px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white">
              Sale
            </span>
          ) : null}

          {variant === "default" ? (
            <div className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-500 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  handleAdd();
                }}
                className="btn btn-light w-full shadow-[var(--shadow-luxury-sm)]"
              >
                Add to Bag
              </button>
            </div>
          ) : null}
        </div>
      </Link>

      <div className="mt-4 flex flex-1 flex-col">
        {categoryName ? (
          <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--color-faint)]">
            {categoryName}
          </p>
        ) : null}
        <Link href={`/product/${product.slug}`} className="mt-1.5 block">
          <h3 className="line-clamp-2 text-[0.92rem] leading-snug text-[var(--color-ink-soft)] transition-colors group-hover:text-[var(--color-faint)]">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-baseline gap-2 text-sm">
          {isOnSale && product.regularPrice ? (
            <>
              <span className="line-through text-[var(--color-faint)]">
                {formatPriceText(product.regularPrice)}
              </span>
              <span className="price">{formatPriceText(product.salePrice)}</span>
            </>
          ) : product.price ? (
            <span className="price">{formatPriceText(product.price)}</span>
          ) : (
            <span className="text-[var(--color-faint)]">Price on request</span>
          )}
        </div>

        {variant === "compact" ? (
          <button
            type="button"
            onClick={handleAdd}
            className="mt-3 text-[0.68rem] uppercase tracking-[0.22em] text-[var(--color-ink-soft)] underline-offset-4 hover:underline"
          >
            Add to Bag
          </button>
        ) : null}
      </div>
    </article>
  );
}
