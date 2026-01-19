import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false, // good for Sanity dev
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'yt3.ggpht.com',
        pathname: '/**',
      },
    ],
  },
  reactCompiler: true,
}

export default nextConfig