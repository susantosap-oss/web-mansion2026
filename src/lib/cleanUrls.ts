import { CleanURL } from '@/types'
import { readConfig } from '@/lib/serverConfig'

export async function getCleanURLs(): Promise<CleanURL[]> {
  try {
    const value = await readConfig('clean_urls')
    if (!value) return []
    return JSON.parse(value) as CleanURL[]
  } catch { return [] }
}

export async function findCleanURL(slug: string): Promise<CleanURL | null> {
  const all = await getCleanURLs()
  return all.find(c => c.slug === slug && c.active) ?? null
}
