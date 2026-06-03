import Link from "next/link";

import NewsletterForm from "@/components/layout/NewsletterForm";
import { getLatestPosts, getProductCategories } from "@/lib/graphql";
import { siteConfig } from "@/lib/site-config";

export default async function Footer() {
  const [categories, posts] = await Promise.all([
    getProductCategories(6),
    getLatestPosts(3),
  ]);

  const year = new Date().getFullYear();
  const hasContact = Object.values(siteConfig.contact).some(Boolean);

  return (
    <footer className="bg-[var(--color-onyx)] text-white">
      <div className="container-app py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div>
            <Link
              href="/"
              className="font-serif text-2xl font-light uppercase tracking-[0.42em]"
            >
              {siteConfig.brandName}
            </Link>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/65">
              A quietly modern atelier of considered pieces. Catalog and editorial
              content arrive live from our WordPress workspace.
            </p>
            <NewsletterForm />
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-[0.68rem] uppercase tracking-[0.24em] text-white">
                Shop
              </h3>
              <ul className="mt-5 space-y-3">
                <li>
                  <Link href="/shop" className="text-sm text-white/65 transition-colors hover:text-white">
                    All Products
                  </Link>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/shop?category=${category.slug}`}
                      className="text-sm text-white/65 transition-colors hover:text-white"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[0.68rem] uppercase tracking-[0.24em] text-white">
                Studio
              </h3>
              <ul className="mt-5 space-y-3">
                <li>
                  <Link href="/about" className="text-sm text-white/65 transition-colors hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/editorial" className="text-sm text-white/65 transition-colors hover:text-white">
                    Editorial
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-white/65 transition-colors hover:text-white">
                    Contact
                  </Link>
                </li>
                {posts.length ? (
                  <li>
                    <Link href={`/blog/${posts[0].slug}`} className="text-sm text-white/65 transition-colors hover:text-white">
                      Latest from the journal
                    </Link>
                  </li>
                ) : null}
              </ul>
            </div>

            <div>
              <h3 className="text-[0.68rem] uppercase tracking-[0.24em] text-white">
                Account
              </h3>
              <ul className="mt-5 space-y-3">
                <li>
                  <Link href="/login" className="text-sm text-white/65 transition-colors hover:text-white">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-sm text-white/65 transition-colors hover:text-white">
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link href="/account/orders" className="text-sm text-white/65 transition-colors hover:text-white">
                    Order History
                  </Link>
                </li>
                <li>
                  <Link href="/account/profile" className="text-sm text-white/65 transition-colors hover:text-white">
                    Profile
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {hasContact ? (
          <div className="mt-12 grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-3">
            {siteConfig.contact.email ? (
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-white/55">Email</p>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="mt-2 inline-block text-sm text-white hover:text-white/65"
                >
                  {siteConfig.contact.email}
                </a>
              </div>
            ) : null}
            {siteConfig.contact.phone ? (
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-white/55">Phone</p>
                <a
                  href={`tel:${siteConfig.contact.phone}`}
                  className="mt-2 inline-block text-sm text-white hover:text-white/65"
                >
                  {siteConfig.contact.phone}
                </a>
              </div>
            ) : null}
            {siteConfig.contact.address ? (
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-white/55">Studio</p>
                <p className="mt-2 text-sm text-white/85">{siteConfig.contact.address}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs uppercase tracking-[0.18em] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {siteConfig.brandName}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-white">Heritage</Link>
            <Link href="/contact" className="hover:text-white">Concierge</Link>
            {siteConfig.instagram.feedUrl ? (
              <a
                href={siteConfig.instagram.feedUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                Instagram
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
