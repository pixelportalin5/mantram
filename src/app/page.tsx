import Image from "next/image";
import Link from "next/link";

import CategoryCarousel from "@/components/ui/CategoryCarousel";
import ProductCarousel from "@/components/ui/ProductCarousel";
import { formatDate } from "@/lib/format";
import {
  getHomeData,
  getPageByUri,
  stripHtml,
  type BlogPost,
  type Product,
  type WordPressPage,
} from "@/lib/graphql";
import { siteConfig } from "@/lib/site-config";

function Hero({ product }: { product: Product | null }) {
  const image = product?.image;
  const category = product?.productCategories?.nodes[0];

  return (
    <section className="relative isolate min-h-[80vh] overflow-hidden bg-[var(--color-onyx)] text-white lg:min-h-[88vh]">
      {image?.sourceUrl ? (
        <Image
          src={image.sourceUrl}
          alt={image.altText || product?.name || siteConfig.brandName}
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover opacity-80"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#3a352f] to-[#1e1c19]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-black/10" />

      <div className="container-app relative z-10 flex min-h-[80vh] flex-col items-start justify-end pb-16 pt-32 lg:min-h-[88vh] lg:pb-24">
        <div className="max-w-2xl">
          {category ? (
            <p className="mb-5 text-[0.7rem] uppercase tracking-[0.3em] text-white/80">
              {category.name}
            </p>
          ) : (
            <p className="mb-5 text-[0.7rem] uppercase tracking-[0.3em] text-white/80">
              New Arrivals
            </p>
          )}
          <h1 className="display-1 max-w-3xl">
            {product?.name ?? "Quiet luxury, considered for everyday."}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/75">
            A modern atelier of timeless silhouettes and objects — sourced and refined
            for a slower, more deliberate way of living.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {product ? (
              <Link href={`/product/${product.slug}`} className="btn btn-light">
                Discover This Piece
              </Link>
            ) : null}
            <Link
              href="/shop"
              className="btn btn-secondary border-white text-white hover:bg-white hover:text-[var(--color-ink-soft)]"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ValueRow() {
  const items = [
    {
      title: "Considered Curation",
      copy: "A small, intentional catalog refreshed by hand.",
    },
    {
      title: "Atelier Provenance",
      copy: "Every piece is sourced from independent makers.",
    },
    {
      title: "Concierge Service",
      copy: "Order assistance, sizing, and aftercare on request.",
    },
    {
      title: "Effortless Returns",
      copy: "Two weeks to live with a piece before deciding.",
    },
  ];

  return (
    <section className="border-y border-[var(--color-line)] bg-white">
      <div className="container-app grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title}>
            <h3 className="text-[0.72rem] uppercase tracking-[0.24em] text-[var(--color-ink-soft)]">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
              {item.copy}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  link,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  link?: string;
  linkLabel?: string;
}) {
  return (
    <div className="container-app mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h2 className="display-2 text-[var(--color-ink-soft)]">{title}</h2>
      </div>
      {link && linkLabel ? (
        <Link
          href={link}
          className="border-b border-[var(--color-ink-soft)] pb-1 text-[0.7rem] uppercase tracking-[0.24em] text-[var(--color-ink-soft)] transition hover:text-[var(--color-faint)]"
        >
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}

function StorySection({
  page,
  eyebrow,
  fallbackTitle,
  reverse = false,
}: {
  page: WordPressPage | null;
  eyebrow: string;
  fallbackTitle: string;
  reverse?: boolean;
}) {
  if (!page?.content) return null;
  const image = page.featuredImage?.node;

  return (
    <section className="bg-[var(--color-bg)] py-20 lg:py-28">
      <div
        className={`container-app grid gap-12 lg:grid-cols-2 lg:items-center ${
          reverse ? "lg:[&>div:first-child]:order-2" : ""
        }`}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-bg-warm)] lg:aspect-[3/4]">
          {image?.sourceUrl ? (
            <Image
              src={image.sourceUrl}
              alt={image.altText || page.title}
              fill
              unoptimized
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="max-w-xl">
          <p className="eyebrow mb-4">{eyebrow}</p>
          <h2 className="display-2 text-[var(--color-ink-soft)]">
            {page.title || fallbackTitle}
          </h2>
          <div
            className="rich-text mt-6"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </div>
    </section>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  const image = post.featuredImage?.node;
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-bg-warm)]">
        {image?.sourceUrl ? (
          <Image
            src={image.sourceUrl}
            alt={image.altText || post.title}
            fill
            unoptimized
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-[1.04]"
          />
        ) : null}
      </div>
      <div className="pt-5">
        {post.date ? (
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[var(--color-faint)]">
            {formatDate(post.date)}
          </p>
        ) : null}
        <h3 className="mt-2 font-serif text-2xl font-light leading-tight text-[var(--color-ink-soft)]">
          {post.title}
        </h3>
        {post.excerpt ? (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--color-muted)]">
            {stripHtml(post.excerpt)}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const [homeData, brandStoryPage, editorialPage] = await Promise.all([
    getHomeData(),
    getPageByUri("about"),
    getPageByUri("why-choose-us"),
  ]);

  const categories = homeData.categories;
  const featuredProducts = homeData.featuredProducts.length
    ? homeData.featuredProducts
    : homeData.bestSellers;

  return (
    <main>
      <Hero product={homeData.heroProduct} />

      <ValueRow />

      {categories.length ? (
        <section className="bg-white py-20 lg:py-24">
          <SectionHeader
            eyebrow="Shop by Category"
            title="Explore the collection."
            link="/shop"
            linkLabel="View All"
          />
          <CategoryCarousel categories={categories} />
        </section>
      ) : null}

      {featuredProducts.length ? (
        <section className="bg-[var(--color-bg)] py-20 lg:py-28">
          <SectionHeader
            eyebrow="Featured Pieces"
            title="A considered edit."
            link="/shop"
            linkLabel="Shop All Products"
          />
          <ProductCarousel products={featuredProducts} />
        </section>
      ) : null}

      <StorySection
        page={brandStoryPage}
        eyebrow="The House"
        fallbackTitle="A heritage of distinction."
      />

      {homeData.bestSellers.length && homeData.bestSellers !== homeData.featuredProducts ? (
        <section className="bg-white py-20 lg:py-28">
          <SectionHeader
            eyebrow="Best Sellers"
            title="Most loved by the house."
            link="/shop?sort=best-selling"
            linkLabel="View All"
          />
          <ProductCarousel products={homeData.bestSellers} />
        </section>
      ) : null}

      <StorySection
        page={editorialPage}
        eyebrow="Editorial"
        fallbackTitle="Inspiration, woven through the catalog."
        reverse
      />

      {homeData.posts.length ? (
        <section className="bg-[var(--color-bg)] py-20 lg:py-28">
          <div className="container-app">
            <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow mb-3">Journal</p>
                <h2 className="display-2 text-[var(--color-ink-soft)]">
                  Notes from the studio.
                </h2>
              </div>
              <Link
                href="/blog"
                className="border-b border-[var(--color-ink-soft)] pb-1 text-[0.7rem] uppercase tracking-[0.24em] text-[var(--color-ink-soft)] transition hover:text-[var(--color-faint)]"
              >
                Read the journal
              </Link>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {homeData.posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
