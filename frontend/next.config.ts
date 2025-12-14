import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bizweb.dktcdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nanghandmade.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
