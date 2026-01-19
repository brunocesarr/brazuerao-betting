import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.0.1.186'],
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'api.sofascore.com' }],
    unoptimized: process.env.NODE_ENV === 'development',
  },
}

export default nextConfig
