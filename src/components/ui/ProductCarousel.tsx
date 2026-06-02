"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

import ProductCard from "@/components/ui/ProductCard";
import type { Product } from "@/lib/graphql";

type ProductCarouselProps = {
  products: Product[];
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

export default function ProductCarousel({ products }: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
    slidesToScroll: 1,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

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

  if (!products.length) return null;

  return (
    <div className="relative">
      <div className="container-app">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="-ml-5 flex touch-pan-y md:-ml-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="min-w-0 shrink-0 grow-0 basis-3/4 pl-5 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 md:pl-6"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 hidden items-center justify-center gap-3 md:flex">
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canPrev}
            aria-label="Previous products"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-line)] bg-white text-[var(--color-ink-soft)] transition hover:border-[var(--color-ink-soft)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Arrow direction="left" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canNext}
            aria-label="Next products"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-line)] bg-white text-[var(--color-ink-soft)] transition hover:border-[var(--color-ink-soft)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Arrow direction="right" />
          </button>
        </div>
      </div>
    </div>
  );
}
