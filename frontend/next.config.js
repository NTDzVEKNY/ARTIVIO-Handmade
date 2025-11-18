/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig;