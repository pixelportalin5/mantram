import Image from "next/image";
import Link from "next/link";

import { formatDate } from "@/lib/format";
import { stripHtml, type BlogPost } from "@/lib/graphql";

type PostCardProps = {
  post: BlogPost;
};

export default function PostCard({ post }: PostCardProps) {
  const image = post.featuredImage?.node;
  const category = post.categories?.nodes?.[0];

  return (
    <article className="group flex h-full flex-col">
      <Link href={`/blog/${post.slug}`} className="block">
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
          ) : (
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
              <span className="text-[10px] uppercase tracking-[0.28em] text-[var(--color-faint)]">
                Editorial image coming soon
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col pt-5">
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-[var(--color-faint)]">
          {category ? <span>{category.name}</span> : null}
          {category && post.date ? <span aria-hidden="true">·</span> : null}
          {post.date ? <span>{formatDate(post.date)}</span> : null}
        </div>
        <h3 className="mt-3 font-serif text-[24px] font-light leading-snug tracking-[-0.01em] text-[var(--color-ink-soft)]">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors duration-200 hover:text-[var(--color-faint)]"
          >
            {post.title}
          </Link>
        </h3>
        {post.excerpt ? (
          <p className="mt-3 line-clamp-3 text-[14px] leading-7 text-[var(--color-muted)]">
            {stripHtml(post.excerpt)}
          </p>
        ) : null}
        <Link
          href={`/blog/${post.slug}`}
          className="mt-5 inline-block self-start border-b border-[var(--color-ink-soft)] pb-1 text-[11px] uppercase tracking-[0.24em] text-[var(--color-ink-soft)] transition-colors duration-200 hover:text-[var(--color-faint)]"
        >
          Read More
        </Link>
      </div>
    </article>
  );
}
