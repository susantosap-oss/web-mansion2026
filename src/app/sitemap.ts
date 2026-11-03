import { MetadataRoute } from 'next'
import { getListings, getProjects, getAgents, getNews } from '@/lib/sheets'
import { getCleanURLs } from '@/lib/cleanUrls'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mansionpro.id'

  const staticPages = [
    { url: BASE,                    priority: 1.0, changeFrequency: 'daily'   as const },
    { url: `${BASE}/listings`,      priority: 0.9, changeFrequency: 'daily'   as const },
    { url: `${BASE}/projects`,      priority: 0.9, changeFrequency: 'weekly'  as const },
    { url: `${BASE}/agents`,        priority: 0.7, changeFrequency: 'weekly'  as const },
    { url: `${BASE}/news`,          priority: 0.7, changeFrequency: 'weekly'  as const },
    { url: `${BASE}/calculator`,    priority: 0.6, changeFrequency: 'monthly' as const },
    { url: `${BASE}/asset-bank`,    priority: 0.8, changeFrequency: 'weekly'  as const },
    { url: `${BASE}/daftar-harga`,  priority: 0.7, changeFrequency: 'weekly'  as const },
    { url: `${BASE}/titip-listing`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${BASE}/cari`,          priority: 0.6, changeFrequency: 'weekly'  as const },
    { url: `${BASE}/about`,         priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${BASE}/contact`,       priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${BASE}/career`,        priority: 0.5, changeFrequency: 'monthly' as const },
  ]

  try {
    const [listings, projects, agents, news, cleanURLs] = await Promise.all([getListings(), getProjects(), getAgents(), getNews(), getCleanURLs()])

    const listingPages = listings.map(l => ({
      url:             `${BASE}/listings/${l.slug}`,
      priority:        0.8,
      changeFrequency: 'weekly' as const,
      lastModified:    l.updatedAt ? new Date(l.updatedAt) : new Date(),
    }))

    const projectPages = projects.map(p => ({
      url:             `${BASE}/projects/${p.slug}`,
      priority:        0.8,
      changeFrequency: 'weekly' as const,
    }))

    const agentPages = agents
      .filter(a => a.verified)
      .map(a => ({
        url:             `${BASE}/agents/${a.id}`,
        priority:        0.7,
        changeFrequency: 'weekly' as const,
      }))

    const newsPages = news
      .filter(n => n.slug)
      .map(n => ({
        url:             `${BASE}/news/${n.slug}`,
        priority:        0.6,
        changeFrequency: 'monthly' as const,
        lastModified:    n.publishedAt ? new Date(n.publishedAt) : new Date(),
      }))

    const listingCleanURLPages = cleanURLs
      .filter(c => (c.pathPrefix ?? 'listings') === 'listings' && c.active)
      .map(c => ({
        url:             `${BASE}/listings/${c.slug}`,
        priority:        0.8,
        changeFrequency: 'weekly' as const,
      }))

    const newsCleanURLPages = cleanURLs
      .filter(c => (c.pathPrefix ?? 'listings') === 'news' && c.active)
      .map(c => ({
        url:             `${BASE}/news/${c.slug}`,
        priority:        0.6,
        changeFrequency: 'monthly' as const,
      }))

    const calculatorCleanURLPages = cleanURLs
      .filter(c => (c.pathPrefix ?? 'listings') === 'calculator' && c.active)
      .map(c => ({
        url:             `${BASE}/calculator/${c.slug}`,
        priority:        0.7,
        changeFrequency: 'monthly' as const,
      }))

    const assetBankCleanURLPages = cleanURLs
      .filter(c => (c.pathPrefix ?? 'listings') === 'asset-bank' && c.active)
      .map(c => ({
        url:             `${BASE}/asset-bank/${c.slug}`,
        priority:        0.8,
        changeFrequency: 'weekly' as const,
      }))

    const daftarHargaCleanURLPages = cleanURLs
      .filter(c => (c.pathPrefix ?? 'listings') === 'daftar-harga' && c.active)
      .map(c => ({
        url:             `${BASE}/daftar-harga/${c.slug}`,
        priority:        0.7,
        changeFrequency: 'weekly' as const,
      }))

    const titipListingCleanURLPages = cleanURLs
      .filter(c => (c.pathPrefix ?? 'listings') === 'titip-listing' && c.active)
      .map(c => ({
        url:             `${BASE}/titip-listing/${c.slug}`,
        priority:        0.6,
        changeFrequency: 'monthly' as const,
      }))

    const projectsCleanURLPages = cleanURLs
      .filter(c => (c.pathPrefix ?? 'listings') === 'projects' && c.active)
      .map(c => ({
        url:             `${BASE}/projects/${c.slug}`,
        priority:        0.8,
        changeFrequency: 'weekly' as const,
      }))

    const agentsCleanURLPages = cleanURLs
      .filter(c => (c.pathPrefix ?? 'listings') === 'agents' && c.active)
      .map(c => ({
        url:             `${BASE}/agents/${c.slug}`,
        priority:        0.7,
        changeFrequency: 'weekly' as const,
      }))

    return [...staticPages, ...listingPages, ...listingCleanURLPages, ...projectPages, ...projectsCleanURLPages, ...agentPages, ...agentsCleanURLPages, ...newsPages, ...newsCleanURLPages, ...calculatorCleanURLPages, ...assetBankCleanURLPages, ...daftarHargaCleanURLPages, ...titipListingCleanURLPages]
  } catch (e) {
    console.error('[sitemap] gagal fetch data dinamis, fallback ke static pages:', e)
    return staticPages
  }
}
