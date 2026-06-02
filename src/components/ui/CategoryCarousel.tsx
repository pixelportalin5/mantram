"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import type { ProductCategory } from "@/lib/graphql";

type CategoryCarouselProps = {
  categories: ProductCategory[];
};

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

export default function CategoryCarousel({ categories }: CategoryCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
    slidesToScroll: 1,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!categories.length) {
    return null;
  }

  return (
    <div className="relative">
      <div className="container-app">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="-ml-4 flex touch-pan-y md:-ml-5">
            {categories.map((category) => {
              const imageUrl = category.image?.sourceUrl;
              const broken = imageUrl ? failedImages.has(imageUrl) : false;
              return (
                <div
                  key={category.id}
                  className="min-w-0 shrink-0 grow-0 basis-1/2 pl-4 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 md:pl-5"
                >
                  <Link
                    href={`/shop?category=${category.slug}`}
                    className="group block"
                  >
                    <div className="relative aspect-square overflow-hidden bg-[var(--color-bg-warm)]">
                      {imageUrl && !broken ? (
                        <Image
                          src={imageUrl}
                          alt={category.image?.altText || category.name}
                          fill
                          unoptimized
                          sizes="(min-width: 1280px) 220px, (min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                          className="object-cover transition duration-700 group-hover:scale-[1.06]"
                          onError={() =>
                            setFailedImages((current) => {
                              const next = new Set(current);
                              next.add(imageUrl);
                              return next;
                            })
                          }
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-6 text-center">
                          <span className="text-[0.65rem] uppercase tracking-[0.24em] text-[var(--color-faint)]">
                            {category.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 text-center">
                      <h3 className="text-[0.78rem] uppercase tracking-[0.18em] text-[var(--color-ink-soft)] group-hover:text-[var(--color-faint)]">
                        {category.name}
                      </h3>
                      {category.count != null ? (
                        <p className="mt-1 text-[0.68rem] uppercase tracking-[0.14em] text-[var(--color-faint)]">
                          {category.count} {category.count === 1 ? "piece" : "pieces"}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 hidden items-center justify-center gap-3 md:flex">
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canPrev}
            aria-label="Previous categories"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-line)] bg-white text-[var(--color-ink-soft)] transition hover:border-[var(--color-ink-soft)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Arrow direction="left" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canNext}
            aria-label="Next categories"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-line)] bg-white text-[var(--color-ink-soft)] transition hover:border-[var(--color-ink-soft)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Arrow direction="right" />
          </button>
        </div>
      </div>
    </div>
  );
}
