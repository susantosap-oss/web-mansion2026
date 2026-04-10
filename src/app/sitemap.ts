import { MetadataRoute } from 'next'
import { getListings, getProjects, getAgents } from '@/lib/sheets'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mansionpro.id'

  const staticPages = [
    { url: BASE,               priority: 1.0,  changeFrequency: 'daily'   as const },
    { url: `${BASE}/listings`, priority: 0.9,  changeFrequency: 'daily'   as const },
    { url: `${BASE}/projects`, priority: 0.9,  changeFrequency: 'weekly'  as const },
    { url: `${BASE}/agents`,   priority: 0.7,  changeFrequency: 'weekly'  as const },
    { url: `${BASE}/news`,     priority: 0.7,  changeFrequency: 'weekly'  as const },
    { url: `${BASE}/calculator`,priority: 0.6, changeFrequency: 'monthly' as const },
  ]

  try {
    const [listings, projects, agents] = await Promise.all([getListings(), getProjects(), getAgents()])

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

    return [...staticPages, ...listingPages, ...projectPages, ...agentPages]
  } catch {
    return staticPages
  }
}
