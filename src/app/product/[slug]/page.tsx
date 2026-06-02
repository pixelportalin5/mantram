import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ProductCard from "@/components/ui/ProductCard";
import ProductGallery from "@/components/ui/ProductGallery";
import ProductPurchasePanel from "@/components/ui/ProductPurchasePanel";
import ProductTabs from "@/components/ui/ProductTabs";
import { getProductBySlug, stripHtml } from "@/lib/graphql";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  return {
    title: product.name,
    description: stripHtml(product.shortDescription || product.description).slice(
      0,
      155,
    ),
    openGraph: {
      images: product.image?.sourceUrl ? [product.image.sourceUrl] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const categories = product.productCategories?.nodes ?? [];
  const primaryCategory = categories[0];
  const relatedProducts = product.related?.nodes ?? [];

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="container-app">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 pt-6 text-xs uppercase tracking-[0.18em] text-[var(--color-faint)] lg:pt-8"
        >
          <Link href="/" className="hover:text-[var(--color-ink-soft)]">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[var(--color-ink-soft)]">
            Shop
          </Link>
          {primaryCategory ? (
            <>
              <span>/</span>
              <Link
                href={`/shop?category=${primaryCategory.slug}`}
                className="hover:text-[var(--color-ink-soft)]"
              >
                {primaryCategory.name}
              </Link>
            </>
          ) : null}
          <span>/</span>
          <span className="text-[var(--color-ink-soft)]">{product.name}</span>
        </nav>

        <div className="grid gap-12 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-16">
          <ProductGallery product={product} />

          <section className="lg:sticky lg:top-32 lg:self-start">
            <div>
              {categories.length ? (
                <div className="mb-5 flex flex-wrap gap-3">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/shop?category=${category.slug}`}
                      className="text-[0.68rem] uppercase tracking-[0.22em] text-[var(--color-faint)] underline-offset-4 hover:text-[var(--color-ink-soft)] hover:underline"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              ) : null}

              <h1 className="font-serif text-4xl font-light leading-tight tracking-[-0.02em] text-[var(--color-ink-soft)] md:text-5xl">
                {product.name}
              </h1>

              {product.shortDescription ? (
                <div
                  className="mt-5 text-base leading-7 text-[var(--color-muted)]"
                  dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                />
              ) : null}
            </div>

            <div className="mt-8">
              <ProductPurchasePanel product={product} />
            </div>
          </section>
        </div>

        <div className="pb-16 lg:pb-24">
          <ProductTabs product={product} />
        </div>

        {relatedProducts.length ? (
          <section className="border-t border-[var(--color-line)] pb-20 pt-16 lg:pb-28">
            <div className="mb-10 text-center">
              <p className="eyebrow">You may also like</p>
              <h2 className="display-2 mt-3 text-[var(--color-ink-soft)]">
                More from the collection.
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
