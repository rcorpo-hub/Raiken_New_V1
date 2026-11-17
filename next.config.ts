import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    cpus: 1,
    agentUpgrade: 'security',
  },
  async redirects() {
    return [
      {
        source: '/engage',
        destination: '/nc',
        permanent: true,
      },
      {
        source: '/conveyancing-services',
        destination: 'https://conveyancing.rcorpo.com/',
        permanent: true,
      },
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
