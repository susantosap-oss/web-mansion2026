import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mansionpro.id'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/login', '/api/'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
