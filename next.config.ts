import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  // Stop `next dev` from writing AGENTS.md and CLAUDE.md into the project root.
  agentRules: false,
  // `typescript` resolves to the TypeScript 6 compatibility package (typescript-eslint cannot use 7 yet), which ships the compiler API but
  // no `tsc` binary. Next's default CLI-based setup check looks for that binary, so tell it to use the API instead.
  experimental: { useTypeScriptCli: false },
  async headers() {
    return [
      // The dashboard is for signed in members. robots.txt keeps crawlers out, and this keeps it out of results if a link to it is ever found.
      { source: "/dashboard/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/login", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
    ];
  },
  images: {
    // AVIF is a lot smaller than WebP for the photos and posters; browsers that can't read it get WebP.
    formats: ["image/avif", "image/webp"],
    // Pictures only change when a file is renamed (that is how we bust the cache), so let browsers keep them for a month.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
