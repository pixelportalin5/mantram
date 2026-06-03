import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Compass,
  Gem,
  Hammer,
  HeartPulse,
  MapPin,
  Package,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import type { WordPressPage } from "@/lib/graphql";

const PILLARS = [
  "Authentic sourcing",
  "Spiritual significance",
  "Modern luxury",
  "Artisanal craftsmanship",
];

const VALUES: Array<{ title: string; copy: string; icon: LucideIcon }> = [
  {
    title: "Authenticity",
    copy: "Every gemstone is verified, every supplier vetted — provenance is non-negotiable.",
    icon: BadgeCheck,
  },
  {
    title: "Craftsmanship",
    copy: "Pieces shaped by hand in small studios, finished with the patience that takes.",
    icon: Hammer,
  },
  {
    title: "Healing Energy",
    copy: "Stones chosen for their resonance, then cleansed and charged before they leave us.",
    icon: HeartPulse,
  },
  {
    title: "Timeless Design",
    copy: "Silhouettes that read as quietly today as they will a decade from now.",
    icon: Compass,
  },
];

const PROCESS: Array<{ step: string; title: string; copy: string; icon: LucideIcon }> = [
  {
    step: "01",
    title: "Source",
    copy: "Mines and lapidaries visited in person across India, Brazil and Madagascar.",
    icon: MapPin,
  },
  {
    step: "02",
    title: "Curate",
    copy: "Edits made by hand — colour, clarity, intention — a small percentage chosen.",
    icon: Sparkles,
  },
  {
    step: "03",
    title: "Craft",
    copy: "Set by independent ateliers using traditional techniques and recycled metals.",
    icon: Hammer,
  },
  {
    step: "04",
    title: "Deliver",
    copy: "Signature packaging, insured shipping, and concierge follow-up on every order.",
    icon: Package,
  },
];

const STATS: Array<{ value: string; label: string }> = [
  { value: "10,000+", label: "Happy customers" },
  { value: "500+", label: "Pieces curated" },
  { value: "50+", label: "Crystal varieties" },
  { value: "100%", label: "Authentic provenance" },
];

export function AboutHero({ wpPage }: { wpPage: WordPressPage | null }) {
  const hasImage = Boolean(wpPage?.featuredImage?.node?.sourceUrl);
  return (
    <section className="bg-white">
      <div className="container-app pt-16 pb-12 text-center lg:pt-24 lg:pb-16">
        <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--color-faint)]">
          The House
        </p>
        <h1 className="display-1 mt-6 mx-auto max-w-4xl">
          {wpPage?.title || "About Mantram"}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-8 text-[var(--color-muted)]">
          A modern destination for crystals, gemstone jewellery, healing objects and
          intentional living — sourced with integrity, curated with restraint.
        </p>
      </div>

      {hasImage ? (
        <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden bg-[var(--color-bg-warm)] lg:h-[72vh]">
          <Image
            src={wpPage!.featuredImage!.node!.sourceUrl as string}
            alt={
              wpPage?.featuredImage?.node?.altText || wpPage?.title || "Mantram"
            }
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="border-t border-[var(--color-line)]" />
      )}
    </section>
  );
}

export function OurStory({ wpPage }: { wpPage: WordPressPage | null }) {
  const image = wpPage?.featuredImage?.node;
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="container-app grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-bg-warm)]">
          {image?.sourceUrl ? (
            <Image
              src={image.sourceUrl}
              alt={image.altText || wpPage?.title || "Our story"}
              fill
              unoptimized
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-faint)]">
                Editorial imagery coming soon
              </p>
            </div>
          )}
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-faint)]">
            Our Story
          </p>
          <h2 className="display-2 mt-4">Crafted with intention.</h2>
          {wpPage?.content ? (
            <div
              className="rich-text mt-6"
              dangerouslySetInnerHTML={{ __html: wpPage.content }}
            />
          ) : (
            <div className="rich-text mt-6 space-y-5">
              <p>
                Mantram began as a quiet rebellion against fast trend cycles —
                a small house dedicated to objects with weight: the crystal you
                place by your window, the gemstone you wear against your skin,
                the talisman that sits on your bedside.
              </p>
              <p>
                Every piece in the catalog is sourced from independent mines
                and lapidaries, then finished in ateliers that still measure
                progress by hand. Our promise is unhurried — to bring you
                pieces worth living with.
              </p>
            </div>
          )}

          <ul className="mt-10 grid grid-cols-2 gap-4">
            {PILLARS.map((pillar) => (
              <li
                key={pillar}
                className="border-t border-[var(--color-line)] pt-3 text-[13px] uppercase tracking-[0.18em] text-[var(--color-ink-soft)]"
              >
                {pillar}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function BrandValues() {
  return (
    <section className="border-y border-[var(--color-line)] bg-[var(--color-bg)] py-20 lg:py-24">
      <div className="container-app">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-faint)]">
            What we stand for
          </p>
          <h2 className="display-2 mt-4">Brand values.</h2>
          <p className="mt-4 text-[15px] leading-7 text-[var(--color-muted)]">
            Four principles that shape every decision — from the mines we visit
            to the way we wrap a piece before it leaves the studio.
          </p>
        </div>

        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ title, copy, icon: Icon }) => (
            <article
              key={title}
              className="group flex flex-col items-start border-t border-[var(--color-line)] pt-6 transition-transform duration-300 ease-out hover:-translate-y-1"
            >
              <Icon
                aria-hidden="true"
                size={28}
                strokeWidth={1.25}
                className="text-[#2f2a24] transition-colors duration-300 group-hover:text-[var(--color-gold)]"
              />
              <h3 className="mt-5 font-serif text-[24px] font-light leading-snug tracking-[-0.01em] text-[var(--color-ink-soft)]">
                {title}
              </h3>
              <p className="mt-3 text-[14px] leading-6 text-[var(--color-muted)]">
                {copy}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OurProcess() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="container-app">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-faint)]">
              Our Process
            </p>
            <h2 className="display-2 mt-4">Four chapters, every piece.</h2>
          </div>
          <p className="max-w-md text-[14px] leading-7 text-[var(--color-muted)]">
            From a quiet mine in Brazil to the wrapped parcel in your hands —
            the same patient sequence, repeated for every piece in the catalog.
          </p>
        </div>

        <ol className="relative mt-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div
            aria-hidden="true"
            className="absolute left-6 top-3 hidden h-px w-[calc(100%-3rem)] bg-[var(--color-line)] lg:block"
          />
          {PROCESS.map(({ step, title, copy, icon: Icon }) => (
            <li
              key={step}
              className="relative flex flex-col items-start lg:pt-10"
            >
              <span
                aria-hidden="true"
                className="absolute -top-1 hidden h-3 w-3 rounded-full border border-[var(--color-line)] bg-white lg:block"
              />
              <span className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-faint)]">
                {step}
              </span>
              <Icon
                aria-hidden="true"
                size={28}
                strokeWidth={1.25}
                className="mt-5 text-[#2f2a24]"
              />
              <h3 className="mt-4 font-serif text-[22px] font-light leading-snug tracking-[-0.01em]">
                {title}
              </h3>
              <p className="mt-2 text-[14px] leading-6 text-[var(--color-muted)]">
                {copy}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Statistics() {
  return (
    <section className="border-y border-[var(--color-line)] bg-[var(--color-bg)] py-20 lg:py-24">
      <div className="container-app">
        <div className="grid gap-12 md:grid-cols-4 md:gap-6">
          {STATS.map(({ value, label }) => (
            <div
              key={label}
              className="text-center md:text-left first:md:text-left last:md:text-right md:[&:nth-child(2)]:text-center md:[&:nth-child(3)]:text-center"
            >
              <p className="font-serif text-[clamp(2.5rem,5vw+1rem,4.5rem)] font-light leading-none tracking-[-0.03em] text-[var(--color-ink-soft)]">
                {value}
              </p>
              <p className="mt-4 text-[11px] uppercase tracking-[0.28em] text-[var(--color-faint)]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FounderPhilosophy() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="container-app max-w-4xl text-center">
        <Gem
          aria-hidden="true"
          size={32}
          strokeWidth={1.1}
          className="mx-auto text-[#2f2a24]"
        />
        <p className="mt-8 text-[11px] uppercase tracking-[0.3em] text-[var(--color-faint)]">
          Founder Philosophy
        </p>
        <blockquote className="mt-6">
          <p className="font-serif text-[clamp(1.8rem,3vw+1rem,3rem)] font-light leading-[1.25] tracking-[-0.02em] text-[var(--color-ink-soft)]">
            &ldquo;A stone has waited a hundred million years to find you.
            Our work is to keep its dignity intact until it does.&rdquo;
          </p>
          <footer className="mt-10">
            <p className="text-[12px] uppercase tracking-[0.28em] text-[var(--color-ink-soft)]">
              The Mantram Atelier
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[var(--color-faint)]">
              Founding Principle
            </p>
          </footer>
        </blockquote>
      </div>
    </section>
  );
}

export function AboutCta() {
  return (
    <section className="border-t border-[var(--color-line)] bg-[var(--color-bg)] py-24 lg:py-32">
      <div className="container-app text-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-faint)]">
          The Collection
        </p>
        <h2 className="display-1 mt-6 mx-auto max-w-3xl">Begin your journey.</h2>
        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-7 text-[var(--color-muted)]">
          Explore the catalog and find the piece — or the practice — that meets
          you where you are.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/shop" className="btn btn-primary">
            Explore Collection
          </Link>
          <Link href="/editorial" className="btn btn-secondary">
            Read the Journal
          </Link>
        </div>
      </div>
    </section>
  );
}
