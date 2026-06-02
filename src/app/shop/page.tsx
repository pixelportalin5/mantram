import Link from "next/link";

import ShopFilters from "@/components/shop/ShopFilters";
import ShopSort from "@/components/shop/ShopSort";
import ProductCard from "@/components/ui/ProductCard";
import {
  getProductCategories,
  getProductListing,
  type Product,
  type ProductSort,
} from "@/lib/graphql";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function getSort(value: string | undefined): ProductSort {
  if (
    value === "price-asc" ||
    value === "price-desc" ||
    value === "best-selling" ||
    value === "name"
  ) {
    return value;
  }
  return "newest";
}

function getAttributeOptions(products: Product[]) {
  const options = new Set<string>();
  products.forEach((product) => {
    product.attributes?.nodes.forEach((attribute) => {
      attribute.options?.forEach((option) => options.add(option));
    });
  });
  return Array.from(options).sort((a, b) => a.localeCompare(b));
}

function buildPageUrl(
  base: Record<string, string | string[] | undefined>,
  overrides: Record<string, string | null>,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(base)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      if (value[0]) params.set(key, value[0]);
    } else {
      params.set(key, value);
    }
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null || value === "") params.delete(key);
    else params.set(key, value);
  }
  const query = params.toString();
  return `/shop${query ? `?${query}` : ""}`;
}

export const metadata = {
  title: "Shop",
};

const PAGE_SIZE = 12;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const category = getParam(params, "category");
  const after = getParam(params, "after");
  const sort = getSort(getParam(params, "sort"));
  const search = getParam(params, "q");
  const minPriceRaw = getParam(params, "minPrice") ?? "";
  const maxPriceRaw = getParam(params, "maxPrice") ?? "";
  const minPrice = Number.parseFloat(minPriceRaw);
  const maxPrice = Number.parseFloat(maxPriceRaw);
  const attribute = getParam(params, "attribute");

  const [categories, productsConnection] = await Promise.all([
    getProductCategories(50),
    getProductListing({
      first: PAGE_SIZE,
      after: after ?? null,
      categoryIn: category ?? null,
      sort,
      minPrice: Number.isFinite(minPrice) ? minPrice : null,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : null,
      attribute: attribute ?? null,
      search: search ?? null,
    }),
  ]);

  const attributeOptions = getAttributeOptions(productsConnection.nodes);
  const totalAll = categories.reduce((sum, cat) => sum + (cat.count ?? 0), 0);
  const activeCategory = categories.find((cat) => cat.slug === category);
  const total = productsConnection.found ?? productsConnection.nodes.length;
  const heroTitle = search
    ? `Results for “${search}”`
    : activeCategory?.name || "The Collection";

  const nextHref = productsConnection.pageInfo.hasNextPage && productsConnection.pageInfo.endCursor
    ? buildPageUrl(params, { after: productsConnection.pageInfo.endCursor })
    : null;

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="container-app">
        <header className="border-b border-[var(--color-line)] py-12 text-center lg:py-16">
          <p className="eyebrow">
            {search ? "Search" : activeCategory ? "Category" : "Shop"}
          </p>
          <h1 className="display-1 mt-4">{heroTitle}</h1>
          {activeCategory?.image?.sourceUrl ? null : (
            <p className="mt-4 text-sm text-[var(--color-muted)]">
              {total} {total === 1 ? "piece" : "pieces"} available
            </p>
          )}
        </header>

        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-line)] py-4 lg:hidden">
          <ShopFilters
            categories={categories}
            activeCategory={category}
            totalCount={totalAll}
            minPrice={minPriceRaw}
            maxPrice={maxPriceRaw}
            attributes={attributeOptions}
            activeAttribute={attribute}
            search={search}
          />
          <ShopSort value={sort} />
        </div>

        <div className="grid gap-10 py-10 lg:grid-cols-[260px_1fr] lg:gap-14 lg:py-12">
          <ShopFilters
            categories={categories}
            activeCategory={category}
            totalCount={totalAll}
            minPrice={minPriceRaw}
            maxPrice={maxPriceRaw}
            attributes={attributeOptions}
            activeAttribute={attribute}
            search={search}
          />

          <section>
            <div className="mb-8 hidden items-center justify-between border-b border-[var(--color-line)] pb-4 lg:flex">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-faint)]">
                Showing {productsConnection.nodes.length} of {total}
              </p>
              <ShopSort value={sort} />
            </div>

            {productsConnection.nodes.length ? (
              <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {productsConnection.nodes.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="border border-[var(--color-line)] bg-white px-8 py-16 text-center">
                <p className="eyebrow">No matches</p>
                <h2 className="display-3 mt-4 text-[var(--color-ink-soft)]">
                  Nothing here yet.
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--color-muted)]">
                  Adjust your filters or browse the full collection.
                </p>
                <Link href="/shop" className="btn btn-primary mt-6 inline-flex">
                  View All Products
                </Link>
              </div>
            )}

            {nextHref ? (
              <div className="mt-12 flex justify-center">
                <Link href={nextHref} className="btn btn-secondary">
                  Load More
                </Link>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
