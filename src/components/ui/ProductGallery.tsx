"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import type { Product, ProductImage } from "@/lib/graphql";

function imageKey(image: ProductImage, index: number) {
  return `${image.sourceUrl ?? "missing"}-${index}`;
}

export default function ProductGallery({ product }: { product: Product }) {
  const images = useMemo(() => {
    const all = [product.image, ...(product.galleryImages?.nodes ?? [])].filter(
      (image): image is ProductImage => Boolean(image?.sourceUrl),
    );
    return all;
  }, [product.galleryImages?.nodes, product.image]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [zoomActive, setZoomActive] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const active = images[activeIndex];

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowRight")
        setActiveIndex((current) => (current + 1) % images.length);
      if (event.key === "ArrowLeft")
        setActiveIndex((current) =>
          current === 0 ? images.length - 1 : current - 1,
        );
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, images.length]);

  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  if (!images.length) {
    return (
      <div className="flex aspect-square w-full items-center justify-center bg-[var(--color-bg-warm)] text-center">
        <div>
          <p className="eyebrow">Product</p>
          <p className="mt-4 font-serif text-3xl">No imagery available</p>
        </div>
      </div>
    );
  }

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[80px_1fr]">
        {images.length > 1 ? (
          <div className="order-2 -mx-1 flex gap-3 overflow-x-auto px-1 lg:order-1 lg:mx-0 lg:flex-col lg:px-0">
            {images.map((image, index) => (
              <button
                key={imageKey(image, index)}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden border bg-[var(--color-bg-warm)] transition lg:h-20 lg:w-20 ${
                  activeIndex === index
                    ? "border-[var(--color-ink-soft)]"
                    : "border-[var(--color-line)] hover:border-[var(--color-faint)]"
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={image.sourceUrl as string}
                  alt={image.altText || product.name}
                  fill
                  unoptimized
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}

        <div className="order-1 lg:order-2">
          <div
            ref={containerRef}
            className="relative aspect-square overflow-hidden bg-[var(--color-bg-warm)]"
            onMouseEnter={() => setZoomActive(true)}
            onMouseLeave={() => setZoomActive(false)}
            onMouseMove={handleMove}
            onClick={() => setLightboxOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter") setLightboxOpen(true);
            }}
            aria-label="View full size"
          >
            {active?.sourceUrl ? (
              <>
                <Image
                  src={active.sourceUrl}
                  alt={active.altText || product.name}
                  fill
                  priority
                  unoptimized
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className={`object-cover transition-transform duration-200 ${
                    zoomActive ? "scale-150" : "scale-100"
                  }`}
                  style={
                    zoomActive
                      ? {
                          transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                        }
                      : undefined
                  }
                />
                <div className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1 bg-white/85 px-2.5 py-1.5 text-[0.62rem] uppercase tracking-[0.18em] text-[var(--color-ink-soft)] backdrop-blur">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  >
                    <path d="M21 21l-4-4M11 8v6M8 11h6M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" />
                  </svg>
                  Zoom
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {lightboxOpen && active?.sourceUrl ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-fade-in">
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center text-white"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <div className="relative h-[88vh] w-full max-w-5xl">
            <Image
              src={active.sourceUrl}
              alt={active.altText || product.name}
              fill
              unoptimized
              sizes="100vw"
              className="object-contain"
            />
          </div>
          {images.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous"
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveIndex((current) =>
                    current === 0 ? images.length - 1 : current - 1,
                  );
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveIndex((current) => (current + 1) % images.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
