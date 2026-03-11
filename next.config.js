/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript:   { ignoreBuildErrors: true },
  eslint:       { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.cloudinary.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'drive.google.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
}
module.exports = nextConfig
