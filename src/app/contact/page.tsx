import Link from "next/link";
import {
  Clock,
  Crown,
  Gem,
  Gift,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import ContactForm from "@/components/contact/ContactForm";
import NewsletterForm from "@/components/layout/NewsletterForm";
import { getPageByUri, stripHtml } from "@/lib/graphql";
import { siteConfig } from "@/lib/site-config";

const FALLBACK_CONTACT = {
  email: "hello@mantriva.in",
  phone: "+91 98765 43210",
  address: "Gurgaon, India",
};

const STUDIO_HOURS = "Monday – Saturday · 10:00 AM – 7:00 PM";

const SERVICES: Array<{ title: string; copy: string; icon: LucideIcon }> = [
  {
    title: "Product Consultation",
    copy: "Guidance on selection, sizing, and pairings for any piece in the catalog.",
    icon: Sparkles,
  },
  {
    title: "Crystal Guidance",
    copy: "Help choosing the right stone for an intention, ritual, or season of life.",
    icon: Gem,
  },
  {
    title: "Corporate Gifting",
    copy: "Curated gift programmes for clients, teams, and milestone moments.",
    icon: Gift,
  },
  {
    title: "Order Assistance",
    copy: "Tracking, exchanges, payment queries — handled by a real person.",
    icon: Package,
  },
  {
    title: "Bespoke Requests",
    copy: "Sourcing rare pieces or commissioning a custom setting to your specification.",
    icon: Crown,
  },
];

const FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "How long does delivery take?",
    answer:
      "Domestic orders within India ship in 3–5 business days. International orders typically arrive in 7–12 business days. Each parcel includes insured tracking from dispatch to your doorstep.",
  },
  {
    question: "Do you offer international shipping?",
    answer:
      "Yes — we deliver worldwide. Duties and taxes are calculated at checkout and complimentary on orders over ₹25,000. Restricted destinations are flagged before payment.",
  },
  {
    question: "Are your crystals authentic?",
    answer:
      "Every stone is sourced from verified mines and lapidaries, then individually inspected at the studio. We never use heat-treated or coated material without disclosing it on the product page.",
  },
  {
    question: "Can I request personalised recommendations?",
    answer:
      "Absolutely. Share a few notes about your intention or the recipient and our concierge team will respond with a curated selection — usually within one business day.",
  },
  {
    question: "Can I place bulk orders?",
    answer:
      "Yes. Corporate, wedding, and wholesale enquiries are handled directly by the studio. Reach out with quantities and a timeline and we'll prepare a tailored proposal.",
  },
];

export async function generateMetadata() {
  const page = await getPageByUri("contact");
  const description = page?.content
    ? stripHtml(page.content).slice(0, 155)
    : `Speak with the ${siteConfig.brandName} studio for product enquiries, sourcing, gifting, orders, and bespoke recommendations.`;

  return {
    title: page?.title ?? "Contact",
    description,
  };
}

export default async function ContactPage() {
  const wpPage = await getPageByUri("contact");

  const email = siteConfig.contact.email || FALLBACK_CONTACT.email;
  const phone = siteConfig.contact.phone || FALLBACK_CONTACT.phone;
  const address = siteConfig.contact.address || FALLBACK_CONTACT.address;

  const heroHeading = wpPage?.title || "Speak with the Studio";

  return (
    <main className="bg-white">
      {/* SECTION 1 — Hero */}
      <section className="bg-white">
        <div className="container-app py-20 text-center lg:py-28">
          <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--color-faint)]">
            Concierge
          </p>
          <h1 className="display-1 mt-6 mx-auto max-w-4xl">{heroHeading}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-8 text-[var(--color-muted)]">
            Our team is available to assist with product enquiries, sourcing,
            gifting, orders, and bespoke recommendations.
          </p>
        </div>
      </section>

      {/* Optional WordPress copy block */}
      {wpPage?.content ? (
        <section className="border-t border-[var(--color-line)] bg-white py-16 lg:py-20">
          <div className="container-app">
            <div
              className="rich-text mx-auto max-w-3xl"
              dangerouslySetInnerHTML={{ __html: wpPage.content }}
            />
          </div>
        </section>
      ) : null}

      {/* SECTION 2 — Contact Information */}
      <section className="border-y border-[var(--color-line)] bg-[var(--color-bg)] py-16 lg:py-20">
        <div className="container-app">
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard
              icon={Mail}
              label="Email"
              primary={email}
              href={`mailto:${email}`}
            />
            <InfoCard
              icon={Phone}
              label="Phone"
              primary={phone}
              href={`tel:${phone.replace(/\s+/g, "")}`}
            />
            <InfoCard icon={Clock} label="Studio Hours" primary={STUDIO_HOURS} />
            <InfoCard icon={MapPin} label="Location" primary={address} />
          </div>
        </div>
      </section>

      {/* SECTION 3 — Contact Form */}
      <section className="bg-white py-20 lg:py-28">
        <div className="container-app grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="hidden lg:block">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-faint)]">
              Write to the Studio
            </p>
            <h2 className="display-2 mt-4">A note arrives, a note replies.</h2>
            <p className="mt-6 max-w-md text-[15px] leading-8 text-[var(--color-muted)]">
              Every enquiry is read by a member of the team. Tell us about the
              piece, the intention, or the question — we respond within one
              business day.
            </p>

            <ul className="mt-12 space-y-5 border-t border-[var(--color-line)] pt-8 text-[14px] leading-7 text-[var(--color-muted)]">
              <li className="flex items-start gap-3">
                <Sparkles
                  aria-hidden="true"
                  size={18}
                  strokeWidth={1.25}
                  className="mt-0.5 shrink-0 text-[#2f2a24]"
                />
                <span>
                  <span className="text-[var(--color-ink-soft)]">Curators on call.</span>{" "}
                  Real product specialists, not chatbots.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle
                  aria-hidden="true"
                  size={18}
                  strokeWidth={1.25}
                  className="mt-0.5 shrink-0 text-[#2f2a24]"
                />
                <span>
                  <span className="text-[var(--color-ink-soft)]">Quiet replies.</span>{" "}
                  Considered words, never a script.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Crown
                  aria-hidden="true"
                  size={18}
                  strokeWidth={1.25}
                  className="mt-0.5 shrink-0 text-[#2f2a24]"
                />
                <span>
                  <span className="text-[var(--color-ink-soft)]">Concierge access.</span>{" "}
                  Bespoke sourcing, gifting, and aftercare.
                </span>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-faint)] lg:hidden">
              Write to the Studio
            </p>
            <h2 className="display-2 mt-4 lg:hidden">A note arrives, a note replies.</h2>
            <div className="mt-6 lg:mt-0">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — Services */}
      <section className="border-y border-[var(--color-line)] bg-[var(--color-bg)] py-20 lg:py-24">
        <div className="container-app">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-faint)]">
              How We Can Help
            </p>
            <h2 className="display-2 mt-4">Services.</h2>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-[var(--color-muted)]">
              From a single thoughtful question to a multi-piece commission, our
              studio is set up to help quietly and well.
            </p>
          </div>

          <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(({ title, copy, icon: Icon }) => (
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
                <h3 className="mt-5 font-serif text-[22px] font-light leading-snug tracking-[-0.01em] text-[var(--color-ink-soft)]">
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

      {/* SECTION 5 — FAQ */}
      <section className="bg-white py-20 lg:py-28">
        <div className="container-app grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-faint)]">
              Frequently Asked
            </p>
            <h2 className="display-2 mt-4">Questions.</h2>
            <p className="mt-6 text-[14px] leading-7 text-[var(--color-muted)]">
              A quick reference for the most common queries. If your question
              isn&rsquo;t here, the studio is a message away.
            </p>
          </div>

          <div className="border-t border-[var(--color-line)]">
            {FAQS.map(({ question, answer }, index) => (
              <details
                key={question}
                className="group border-b border-[var(--color-line)] py-6 [&[open]_.faq-icon-plus]:hidden [&_.faq-icon-minus]:hidden [&[open]_.faq-icon-minus]:inline"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left text-[16px] font-serif font-light leading-snug tracking-[-0.01em] text-[var(--color-ink-soft)] outline-none transition-colors duration-200 marker:hidden focus-visible:text-[var(--color-faint)]">
                  <span className="flex items-baseline gap-4">
                    <span className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-faint)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{question}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center border border-[var(--color-line)] text-[var(--color-faint)] transition-colors duration-200 group-hover:text-[var(--color-ink-soft)]"
                  >
                    <span className="faq-icon-plus inline text-lg leading-none">+</span>
                    <span className="faq-icon-minus text-lg leading-none">−</span>
                  </span>
                </summary>
                <div className="mt-4 max-w-2xl pl-0 text-[14px] leading-7 text-[var(--color-muted)]">
                  {answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — Newsletter */}
      <section className="border-y border-[var(--color-line)] bg-[var(--color-bg)] py-20 lg:py-24">
        <div className="container-app">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-faint)]">
              Newsletter
            </p>
            <h2 className="display-2 mt-4 text-[var(--color-ink-soft)]">
              Stay connected.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-[var(--color-muted)]">
              Receive new arrivals, editorial stories, and collection updates.
            </p>
            <div className="mx-auto mt-8 max-w-md">
              <NewsletterForm variant="light" showHeading={false} />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — Final CTA */}
      <section className="bg-white py-24 lg:py-32">
        <div className="container-app text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-faint)]">
            The Catalog
          </p>
          <h2 className="display-1 mt-6 mx-auto max-w-3xl">
            Explore the collection.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-7 text-[var(--color-muted)]">
            Browse curated crystals, gemstone jewellery, and rituals — published
            live from the studio.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/shop" className="btn btn-primary">
              Shop All
            </Link>
            <Link href="/editorial" className="btn btn-secondary">
              Read the Journal
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

type InfoCardProps = {
  icon: LucideIcon;
  label: string;
  primary: string;
  href?: string;
};

function InfoCard({ icon: Icon, label, primary, href }: InfoCardProps) {
  const body = (
    <div className="group flex h-full flex-col border-t border-[var(--color-line)] bg-white p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[var(--color-ink-soft)]">
      <Icon
        aria-hidden="true"
        size={26}
        strokeWidth={1.25}
        className="text-[#2f2a24] transition-colors duration-300 group-hover:text-[var(--color-gold)]"
      />
      <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-[var(--color-faint)]">
        {label}
      </p>
      <p className="mt-3 whitespace-pre-line font-serif text-[20px] font-light leading-snug tracking-[-0.01em] text-[var(--color-ink-soft)]">
        {primary}
      </p>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block h-full">
        {body}
      </a>
    );
  }
  return body;
}
