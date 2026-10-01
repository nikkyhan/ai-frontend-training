import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Hide the dev-mode "N" badge so it does not cover content in QA screenshots
  devIndicators: false,
};

export default nextConfig;
