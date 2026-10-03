import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  // `typescript` resolves to the TypeScript 6 compatibility package (typescript-eslint cannot use 7 yet), which ships the compiler API but
  // no `tsc` binary. Next's default CLI-based setup check looks for that binary, so tell it to use the API instead.
  experimental: { useTypeScriptCli: false },
  images: {
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
