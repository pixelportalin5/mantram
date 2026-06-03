import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "goldenrod-badger-491166.hostingersite.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        // /blog (index only) is now superseded by /editorial.
        // Post detail routes /blog/[slug] are preserved as-is.
        source: "/blog",
        destination: "/editorial",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
