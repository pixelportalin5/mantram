import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mantriva.in",
      },
      {
        protocol: "https",
        hostname: "www.mantriva.in",
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
