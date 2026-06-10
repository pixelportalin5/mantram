import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Providers from "@/components/providers/Providers";
import { readSession } from "@/lib/auth-server";
import { siteConfig } from "@/lib/site-config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.brandName} — Curated luxury, ordered with intention.`,
    template: `%s · ${siteConfig.brandName}`,
  },
  description:
    `${siteConfig.brandName} is a curated headless WooCommerce storefront delivering quietly luxurious pieces. Catalog, editorial, and account experiences are powered live by WordPress.`,
  applicationName: siteConfig.brandName,
  openGraph: {
    siteName: siteConfig.brandName,
    type: "website",
    locale: "en_IN",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await readSession();

  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink-soft)] antialiased">
        <Providers initialUser={session?.user ?? null}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:text-sm"
          >
            Skip to content
          </a>
          <Navbar />
          <div id="main">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
