import { stripHtml } from "@/lib/strings";

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(parsed);
}

export function formatPriceText(price: string | null | undefined): string {
  return stripHtml(price ?? "").trim();
}

export function truncate(value: string, max: number): string {
  if (value.length <= max) {
    return value;
  }
  return `${value.slice(0, max).trimEnd()}…`;
}
