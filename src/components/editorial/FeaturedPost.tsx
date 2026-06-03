import Image from "next/image";
import Link from "next/link";

import { formatDate } from "@/lib/format";
import { stripHtml, type BlogPost } from "@/lib/graphql";

type FeaturedPostProps = {
  post: BlogPost;
};

export default function FeaturedPost({ post }: FeaturedPostProps) {
  const image = post.featuredImage?.node;
  const category = post.categories?.nodes?.[0];

  return (
    <article className="group grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
      <Link
        href={`/blog/${post.slug}`}
        className="relative block aspect-[5/4] overflow-hidden bg-[var(--color-bg-warm)] lg:aspect-[4/5]"
      >
        {image?.sourceUrl ? (
          <Image
            src={image.sourceUrl}
            alt={image.altText || post.title}
            fill
            priority
            unoptimized
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
            <span className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-faint)]">
              Editorial image coming soon
            </span>
          </div>
        )}
      </Link>

      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-faint)]">
          Featured
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[var(--color-faint)]">
          {category ? <span>{category.name}</span> : null}
          {category && post.date ? <span aria-hidden="true">·</span> : null}
          {post.date ? <span>{formatDate(post.date)}</span> : null}
        </div>
        <h2 className="display-2 mt-5 text-[var(--color-ink-soft)]">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors duration-200 hover:text-[var(--color-faint)]"
          >
            {post.title}
          </Link>
        </h2>
        {post.excerpt ? (
          <p className="mt-6 max-w-xl text-[15px] leading-8 text-[var(--color-muted)]">
            {stripHtml(post.excerpt)}
          </p>
        ) : null}
        <Link
          href={`/blog/${post.slug}`}
          className="mt-8 inline-block border-b border-[var(--color-ink-soft)] pb-1 text-[11px] uppercase tracking-[0.24em] text-[var(--color-ink-soft)] transition-colors duration-200 hover:text-[var(--color-faint)]"
        >
          Read the story
        </Link>
      </div>
    </article>
  );
}
