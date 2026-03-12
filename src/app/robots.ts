import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://web-mansion2026-cb5stice7a-et.a.run.app'
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
