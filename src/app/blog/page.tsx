import Image from "next/image";
import Link from "next/link";

import { formatDate } from "@/lib/format";
import { getLatestPosts, stripHtml } from "@/lib/graphql";

export const metadata = {
  title: "Editorial",
};

export default async function BlogPage() {
  const posts = await getLatestPosts(12);

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="container-app py-12 lg:py-20">
        <header className="border-b border-[var(--color-line)] pb-10 text-center lg:pb-14">
          <p className="eyebrow">Editorial</p>
          <h1 className="display-1 mt-4">Notes from the studio.</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--color-muted)]">
            Conversations on design, provenance, and a slower way of living —
            published from our WordPress workspace.
          </p>
        </header>

        {posts.length ? (
          <div className="grid gap-x-6 gap-y-14 pt-12 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const image = post.featuredImage?.node;
              return (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-bg-warm)]">
                    {image?.sourceUrl ? (
                      <Image
                        src={image.sourceUrl}
                        alt={image.altText || post.title}
                        fill
                        unoptimized
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition duration-700 group-hover:scale-[1.04]"
                      />
                    ) : null}
                  </div>
                  <div className="pt-5">
                    {post.date ? (
                      <p className="text-[0.66rem] uppercase tracking-[0.22em] text-[var(--color-faint)]">
                        {formatDate(post.date)}
                      </p>
                    ) : null}
                    <h2 className="mt-2 font-serif text-2xl font-light leading-tight text-[var(--color-ink-soft)]">
                      {post.title}
                    </h2>
                    {post.excerpt ? (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--color-muted)]">
                        {stripHtml(post.excerpt)}
                      </p>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-12 border border-[var(--color-line)] bg-white px-8 py-16 text-center">
            <p className="eyebrow">No posts yet</p>
            <h2 className="display-3 mt-4">The journal is being written.</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--color-muted)]">
              Publish a post in WordPress to see it appear here.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
