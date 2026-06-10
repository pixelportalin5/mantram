export function stripHtml(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** WooCommerce / WP placeholder assets should never be used as product imagery. */
export function isUsableProductImageUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;

  const normalized = url.trim().toLowerCase();

  if (normalized.includes("woocommerce-placeholder")) return false;
  if (normalized.endsWith("/placeholder.webp")) return false;
  if (normalized.includes("/placeholder.png")) return false;

  return true;
}

export type ProductImageLike = {
  sourceUrl: string | null;
  mediaDetails?: {
    width?: number | null;
    height?: number | null;
    sizes?: Array<{
      name?: string | null;
      sourceUrl?: string | null;
      width?: string | number | null;
      height?: string | number | null;
    }> | null;
  } | null;
};

/** Prefer full/original URL; fall back to the largest registered WordPress size. */
export function getProductImageUrl(
  image: ProductImageLike | null | undefined,
): string | null {
  if (!image?.sourceUrl) return null;

  const sizes = image.mediaDetails?.sizes;
  if (!sizes?.length) return image.sourceUrl;

  let bestUrl = image.sourceUrl;
  let bestWidth = image.mediaDetails?.width ?? 0;

  for (const size of sizes) {
    const width = Number(size.width ?? 0);
    if (width > bestWidth && size.sourceUrl) {
      bestWidth = width;
      bestUrl = size.sourceUrl;
    }
  }

  return bestUrl;
}

/** Small preview for thumbnail rails (never use for the main stage). */
export function getProductThumbnailUrl(
  image: ProductImageLike | null | undefined,
): string | null {
  if (!image?.sourceUrl) return null;

  const sizes = image.mediaDetails?.sizes;
  if (!sizes?.length) return image.sourceUrl;

  const thumb =
    sizes.find((size) => size.name === "woocommerce_gallery_thumbnail") ??
    sizes.find((size) => size.name === "thumbnail") ??
    sizes.find((size) => size.name === "woocommerce_thumbnail");

  return thumb?.sourceUrl ?? image.sourceUrl;
}

export function parsePriceValue(price: string | null | undefined): number | null {
  const firstAmount = stripHtml(price).match(/[\d,.]+/)?.[0];

  if (!firstAmount) {
    return null;
  }

  const parsedAmount = Number.parseFloat(firstAmount.replace(/,/g, ""));

  return Number.isFinite(parsedAmount) ? parsedAmount : null;
}
