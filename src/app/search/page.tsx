import type { Metadata } from "next";
import Link from "next/link";

import SearchResults from "@/components/search/SearchResults";
import {
  getProductListing,
  searchSuggestions,
} from "@/lib/graphql";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readQuery(params: Record<string, string | string[] | undefined>): string {
  const raw = params.q;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (value ?? "").trim();
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const query = readQuery(params);
  return {
    title: query ? `Search · ${query}` : "Search",
    description: query
      ? `Live search results from the Mantram catalog for “${query}”.`
      : "Search the Mantram catalog.",
    robots: { index: false, follow: true },
  };
}

const PAGE_SIZE = 24;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = readQuery(params);

  if (!query) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)]">
        <div className="container-app py-12 lg:py-20">
          <header className="border-b border-[var(--color-line)] pb-10 text-center lg:pb-14">
            <p className="eyebrow">Search</p>
            <h1 className="display-1 mt-4">Find your next piece.</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--color-muted)]">
              Use the search in the header or browse the full collection.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/shop" className="btn btn-primary">
                Open the Catalog
              </Link>
            </div>
          </header>
        </div>
      </main>
    );
  }

  const [productConnection, suggestions] = await Promise.all([
    getProductListing({ first: PAGE_SIZE, search: query }),
    searchSuggestions(query, { productLimit: 1, categoryLimit: 8 }),
  ]);

  const total = productConnection.found ?? productConnection.nodes.length;

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="container-app py-12 lg:py-16">
        <header className="border-b border-[var(--color-line)] pb-10 text-center lg:pb-14">
          <p className="eyebrow">Search</p>
          <h1 className="display-1 mt-4">
            Results for &ldquo;{query}&rdquo;
          </h1>
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            {total} {total === 1 ? "piece" : "pieces"} from the live catalog
          </p>
        </header>

        <div className="pt-10 lg:pt-14">
          <SearchResults
            query={query}
            products={productConnection.nodes}
            categories={suggestions.categories}
            total={total}
          />
        </div>
      </div>
    </main>
  );
}
