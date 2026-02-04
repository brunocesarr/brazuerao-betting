import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'e1.pxfuel.com' },
      { protocol: 'https', hostname: 'img.freepik.com' },
      { protocol: 'https', hostname: 'api.sofascore.com' },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://brazuerao-next-app.vercel.app/api/v1/:path*',
      },
    ]
  },
}

export default nextConfig
