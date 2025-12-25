/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8080',
                pathname: '/uploads/**',
            },
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