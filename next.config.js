/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: false // Using Pages Router for stability
  },
  images: {
    domains: ['localhost', 'example.com'],
    formats: ['image/webp', 'image/avif']
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/blog/:slug',
        destination: '/blog/post/:slug'
      },
      {
        source: '/category/:slug',
        destination: '/blog/category/:slug'
      },
      {
        source: '/tag/:slug',
        destination: '/blog/tag/:slug'
      },
      {
        source: '/author/:slug',
        destination: '/blog/author/:slug'
      }
    ]
  }
}

module.exports = nextConfig