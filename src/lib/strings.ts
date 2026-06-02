export function stripHtml(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parsePriceValue(price: string | null | undefined): number | null {
  const firstAmount = stripHtml(price).match(/[\d,.]+/)?.[0];

  if (!firstAmount) {
    return null;
  }

  const parsedAmount = Number.parseFloat(firstAmount.replace(/,/g, ""));

  return Number.isFinite(parsedAmount) ? parsedAmount : null;
}
