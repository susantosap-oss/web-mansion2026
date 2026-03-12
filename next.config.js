const withPWA = require('next-pwa')({
  dest:            'public',
  register:        true,
  skipWaiting:     true,
  disable:         process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
      handler:    'CacheFirst',
      options:    { cacheName: 'cloudinary-images', expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 } },
    },
    {
      urlPattern: /^https:\/\/script\.google\.com\/.*/i,
      handler:    'NetworkFirst',
      options:    { cacheName: 'gas-api', expiration: { maxEntries: 50, maxAgeSeconds: 5 * 60 } },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript:   { ignoreBuildErrors: true },
  eslint:       { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'drive.google.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
}

module.exports = withPWA(nextConfig)
