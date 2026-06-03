import Link from "next/link";

import FeaturedPost from "@/components/editorial/FeaturedPost";
import PostCard from "@/components/editorial/PostCard";
import NewsletterForm from "@/components/layout/NewsletterForm";
import {
  getFeaturedPost,
  getPostCategories,
  getPosts,
} from "@/lib/graphql";

export const metadata = {
  title: "Editorial",
  description:
    "Stories, rituals and insights from the Mantram studio — crystals, mindful living, healing traditions and intentional design.",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readCategory(
  params: Record<string, string | string[] | undefined>,
): string | null {
  const raw = params.category;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.trim() || null;
}

export default async function EditorialPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const categoryFilter = readCategory(params);

  const [featured, postCategories] = await Promise.all([
    categoryFilter ? Promise.resolve(null) : getFeaturedPost(),
    getPostCategories(20),
  ]);

  // When a category filter is active we don't reserve a featured slot.
  const featuredId = featured?.id
    ? Number((featured.id.match(/\d+/) ?? ["0"])[0])
    : 0;

  const posts = await getPosts({
    first: 12,
    categorySlug: categoryFilter,
    excludeIds: featuredId ? [featuredId] : [],
  });

  const activeCategoryName =
    postCategories.find((category) => category.slug === categoryFilter)?.name ??
    categoryFilter;

  const hasFeatured = !categoryFilter && featured;
  const hasPosts = posts.length > 0;
  const hasAnyContent = hasFeatured || hasPosts;

  return (
    <main className="bg-white">
      {/* Section 1 — Editorial Hero */}
      <section className="border-b border-[var(--color-line)] bg-white">
        <div className="container-app py-20 text-center lg:py-28">
          <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--color-faint)]">
            Journal
          </p>
          <h1 className="display-1 mt-6 mx-auto max-w-4xl">
            {categoryFilter
              ? `${activeCategoryName}`
              : "Stories, Rituals & Insights"}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-8 text-[var(--color-muted)]">
            A collection of articles exploring crystals, mindful living, healing
            traditions and intentional design.
          </p>
          {categoryFilter ? (
            <div className="mt-8 flex justify-center">
              <Link
                href="/editorial"
                className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-faint)] underline-offset-4 hover:text-[var(--color-ink-soft)] hover:underline"
              >
                ← All editorial
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      {/* Section 2 — Featured Article */}
      {hasFeatured ? (
        <section className="bg-white py-20 lg:py-28">
          <div className="container-app">
            <FeaturedPost post={featured} />
          </div>
        </section>
      ) : !hasPosts ? (
        <section className="bg-white py-20 lg:py-28">
          <div className="container-app">
            <div className="mx-auto max-w-2xl border border-[var(--color-line)] bg-white px-8 py-20 text-center">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-faint)]">
                The journal is being written
              </p>
              <h2 className="display-3 mt-4">
                {categoryFilter
                  ? `No stories in ${activeCategoryName} yet.`
                  : "No stories published yet."}
              </h2>
              <p className="mx-auto mt-4 max-w-md text-[14px] leading-7 text-[var(--color-muted)]">
                Publish a post in WordPress and it will appear here automatically.
                In the meantime, explore the catalog.
              </p>
              <Link href="/shop" className="btn btn-secondary mt-6 inline-flex">
                Browse the Catalog
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* Section 3 — Article Grid */}
      {hasPosts ? (
        <section className="bg-white pb-20 pt-4 lg:pb-28 lg:pt-8">
          <div className="container-app">
            <div className="mb-10 flex items-end justify-between border-b border-[var(--color-line)] pb-5">
              <h2 className="font-serif text-[28px] font-light tracking-[-0.01em]">
                {categoryFilter ? "Stories" : "Latest Stories"}
              </h2>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-faint)]">
                {posts.length} {posts.length === 1 ? "story" : "stories"}
              </p>
            </div>
            <div className="grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Section 4 — Categories */}
      {postCategories.length ? (
        <section className="border-y border-[var(--color-line)] bg-[var(--color-bg)] py-16 lg:py-20">
          <div className="container-app">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-faint)]">
                  Browse by Topic
                </p>
                <h2 className="display-3 mt-4">Categories.</h2>
              </div>
              <p className="max-w-sm text-[14px] leading-7 text-[var(--color-muted)]">
                Filter the journal by the subjects that resonate — crystals,
                rituals, jewellery, or design.
              </p>
            </div>
            <ul className="mt-10 flex flex-wrap gap-3">
              {postCategories.map((category) => {
                const isActive = category.slug === categoryFilter;
                return (
                  <li key={category.id}>
                    <Link
                      href={
                        isActive
                          ? "/editorial"
                          : `/editorial?category=${category.slug}`
                      }
                      className={`inline-flex items-center gap-2 border px-4 py-2 text-[12px] uppercase tracking-[0.2em] transition-colors duration-200 ${
                        isActive
                          ? "border-[var(--color-ink-soft)] bg-[var(--color-ink-soft)] text-white"
                          : "border-[var(--color-line)] bg-white text-[var(--color-ink-soft)] hover:border-[var(--color-ink-soft)]"
                      }`}
                    >
                      <span>{category.name}</span>
                      {category.count != null ? (
                        <span
                          className={`text-[10px] ${
                            isActive
                              ? "text-white/65"
                              : "text-[var(--color-faint)]"
                          }`}
                        >
                          {category.count}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ) : !hasAnyContent ? null : null}

      {/* Section 5 — Newsletter */}
      <section className="bg-white py-20 lg:py-28">
        <div className="container-app">
          <div className="mx-auto max-w-3xl border border-[var(--color-line)] bg-[var(--color-bg)] px-8 py-14 text-center lg:px-16 lg:py-20">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-faint)]">
              Newsletter
            </p>
            <h2 className="display-2 mt-4 text-[var(--color-ink-soft)]">
              Stay inspired.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-[var(--color-muted)]">
              Receive stories, guides and new arrivals — sent quietly, once a
              fortnight, from the studio.
            </p>
            <div className="mx-auto mt-8 max-w-md">
              <NewsletterForm variant="light" showHeading={false} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
