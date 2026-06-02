import Image from "next/image";

import { getPageByUri, stripHtml } from "@/lib/graphql";

export async function generateMetadata() {
  const page = await getPageByUri("about");

  return {
    title: page?.title ?? "About",
    description: page?.content ? stripHtml(page.content).slice(0, 155) : undefined,
  };
}

export default async function AboutPage() {
  const page = await getPageByUri("about");
  const image = page?.featuredImage?.node;

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="container-app py-12 lg:py-20">
        <header className="border-b border-[var(--color-line)] pb-10 text-center lg:pb-14">
          <p className="eyebrow">The House</p>
          <h1 className="display-1 mt-4">{page?.title ?? "About Mantram"}</h1>
        </header>

        <div className="grid gap-12 pt-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          {image?.sourceUrl ? (
            <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-bg-warm)]">
              <Image
                src={image.sourceUrl}
                alt={image.altText || page?.title || "About"}
                fill
                unoptimized
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="aspect-[4/5] bg-[var(--color-bg-warm)]" />
          )}

          <div>
            {page?.content ? (
              <div
                className="rich-text"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            ) : (
              <p className="rich-text">
                Create a WordPress page with the URI <code>about</code> to populate this
                screen.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
