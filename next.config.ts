import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: 'http', hostname: 'api.sofascore.com' }],
    unoptimized: process.env.NODE_ENV === 'development',
  },
}

export default nextConfig
