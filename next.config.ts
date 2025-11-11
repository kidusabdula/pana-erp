import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  reactStrictMode: true,
  env: {
    // Optional: Define non-sensitive env vars here if needed
  },
  // Enable Vercel’s serverless functions for API routes
  output: "standalone", // Optimizes for Vercel’s serverless environment
  // Add CORS headers if needed for client-side requests
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" }, // Adjust for production
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE" },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
  // Ignore build errors
  typescript: {
    ignoreBuildErrors: true, // Ignores TypeScript errors during production build
  },
};

export default nextConfig;
