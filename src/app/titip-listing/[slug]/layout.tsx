import { Metadata } from 'next'
import { getCleanURLs } from '@/lib/cleanUrls'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mansionpro.id'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug)
  const allURLs = await getCleanURLs()
  const cleanURL = allURLs.find(c => c.pathPrefix === 'titip-listing' && c.slug === slug && c.active)

  if (!cleanURL) {
    // Only noindex when config returned data — this slug truly isn't configured.
    // Empty allURLs most likely means Sheets API is down; don't punish the URL.
    if (allURLs.length > 0) return { robots: { index: false, follow: false } }
    return {}
  }

  return {
    title:       cleanURL.title,
    description: cleanURL.description,
    alternates:  { canonical: `${BASE}/titip-listing/${slug}` },
    robots:      { index: true, follow: true },
    openGraph: {
      title:       cleanURL.title,
      description: cleanURL.description,
      url:         `${BASE}/titip-listing/${slug}`,
      type:        'website',
    },
  }
}

export default function TitipListingSlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
