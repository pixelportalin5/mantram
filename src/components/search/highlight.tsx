import type { ReactNode } from "react";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Splits `text` into segments and wraps any occurrence of `query`
 * (case-insensitive) with a <mark> element. Safe to render directly into JSX.
 */
export function highlightMatch(text: string, query: string): ReactNode {
  const trimmed = query.trim();
  if (!trimmed) return text;

  const pattern = new RegExp(`(${escapeRegex(trimmed)})`, "i");
  const splitter = new RegExp(`(${escapeRegex(trimmed)})`, "ig");
  const parts = text.split(splitter);

  return parts.map((part, index) =>
    pattern.test(part) ? (
      <mark
        key={index}
        className="bg-transparent font-medium text-[var(--color-ink-soft)] underline decoration-[var(--color-gold)] decoration-1 underline-offset-2"
      >
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}
