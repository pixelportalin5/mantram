import Link from "next/link";

import ProductCard from "@/components/ui/ProductCard";
import type { Product, SearchCategoryHit } from "@/lib/graphql";

type SearchResultsProps = {
  query: string;
  products: Product[];
  categories: SearchCategoryHit[];
  total: number;
};

export default function SearchResults({
  query,
  products,
  categories,
  total,
}: SearchResultsProps) {
  const trimmed = query.trim();

  if (!trimmed) {
    return (
      <div className="border border-[var(--color-line)] bg-white px-8 py-16 text-center">
        <p className="eyebrow">Start a search</p>
        <h2 className="display-3 mt-4 text-[var(--color-ink-soft)]">
          What are you looking for today?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--color-muted)]">
          Try a product name, a category, or a material — we search the catalog
          live as it is published in WooCommerce.
        </p>
      </div>
    );
  }

  if (products.length === 0 && categories.length === 0) {
    return (
      <div className="border border-[var(--color-line)] bg-white px-8 py-16 text-center">
        <p className="eyebrow">No results</p>
        <h2 className="display-3 mt-4 text-[var(--color-ink-soft)]">
          Nothing found for &ldquo;{trimmed}&rdquo;.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--color-muted)]">
          Check the spelling, try a broader term, or browse the full collection.
        </p>
        <Link href="/shop" className="btn btn-primary mt-6 inline-flex">
          Browse the Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {categories.length ? (
        <section>
          <p className="eyebrow">Matching Categories</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/shop?category=${category.slug}`}
                  className="inline-flex items-center gap-2 border border-[var(--color-line)] bg-white px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--color-ink-soft)] transition hover:border-[var(--color-ink-soft)]"
                >
                  {category.name}
                  {category.count != null ? (
                    <span className="text-[var(--color-faint)]">
                      ({category.count})
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
          <p className="eyebrow">Products</p>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-faint)]">
            {total} {total === 1 ? "result" : "results"}
          </p>
        </div>

        {products.length ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">
            No products matched your search, but the categories above may help.
          </p>
        )}
      </section>
    </div>
  );
}
