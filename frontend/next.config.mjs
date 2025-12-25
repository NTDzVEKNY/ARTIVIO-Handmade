/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
                port: '8080',
                pathname: '/uploads/**',
            },
        ],
    },
};

export default nextConfig;