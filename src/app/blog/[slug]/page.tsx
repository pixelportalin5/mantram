import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { formatDate } from "@/lib/format";
import { getPostBySlug, stripHtml } from "@/lib/graphql";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post not found" };
  }

  return {
    title: post.title,
    description: stripHtml(post.excerpt || post.content).slice(0, 155),
    openGraph: {
      images: post.featuredImage?.node?.sourceUrl
        ? [post.featuredImage.node.sourceUrl]
        : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const image = post.featuredImage?.node;

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <article className="container-app max-w-4xl py-12 lg:py-16">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--color-faint)]"
        >
          <Link href="/" className="hover:text-[var(--color-ink-soft)]">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-[var(--color-ink-soft)]">
            Editorial
          </Link>
        </nav>

        <header className="mt-8 text-center">
          {post.date ? (
            <p className="text-[0.66rem] uppercase tracking-[0.22em] text-[var(--color-faint)]">
              {formatDate(post.date)}
            </p>
          ) : null}
          <h1 className="display-1 mt-4">{post.title}</h1>
        </header>

        {image?.sourceUrl ? (
          <div className="relative mt-12 aspect-[16/9] overflow-hidden bg-[var(--color-bg-warm)]">
            <Image
              src={image.sourceUrl}
              alt={image.altText || post.title}
              fill
              unoptimized
              priority
              sizes="(min-width: 1024px) 960px, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}

        {post.content ? (
          <div
            className="rich-text mt-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : null}

        <div className="mt-12 border-t border-[var(--color-line)] pt-8 text-center">
          <Link href="/blog" className="btn btn-secondary">
            Back to Editorial
          </Link>
        </div>
      </article>
    </main>
  );
}
