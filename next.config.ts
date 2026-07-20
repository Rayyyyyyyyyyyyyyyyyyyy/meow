import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/meow",
  assetPrefix: "/meow",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
