export const siteConfig = {
  brandName: process.env.NEXT_PUBLIC_SITE_NAME || "Mantram",
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "",
    address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS || "",
  },
  newsletter: {
    actionUrl: process.env.NEXT_PUBLIC_NEWSLETTER_ACTION_URL || "",
  },
  instagram: {
    feedUrl: process.env.NEXT_PUBLIC_INSTAGRAM_FEED_URL || "",
  },
};
