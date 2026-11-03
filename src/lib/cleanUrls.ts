import { CleanURL } from '@/types'
import { readConfig } from '@/lib/serverConfig'

export const NEWS_CATEGORY_SLUG_MAP: Record<string, string> = {
  'berita-properti': 'Berita Properti',
  'tips-trik':       'Tips & Trik',
  'regulasi':        'Regulasi',
  'kpr-pembiayaan':  'KPR & Pembiayaan',
  'investasi':       'Investasi',
  'aset-lelang':     'Aset Lelang',
}

export function prefixOf(c: Pick<CleanURL, 'pathPrefix'>): CleanURL['pathPrefix'] {
  return c.pathPrefix ?? 'listings'
}

export function newsCategoryOf(c: CleanURL): string | undefined {
  return c.newsCategory?.trim() || NEWS_CATEGORY_SLUG_MAP[c.slug]
}

export async function getCleanURLs(): Promise<CleanURL[]> {
  try {
    const value = await readConfig('clean_urls')
    if (!value) return []
    return JSON.parse(value) as CleanURL[]
  } catch { return [] }
}

export async function findCleanURL(slug: string): Promise<CleanURL | null> {
  return findCleanURLByPrefix('listings', slug)
}

export async function findCleanURLByPrefix(prefix: CleanURL['pathPrefix'], slug: string): Promise<CleanURL | null> {
  const all = await getCleanURLs()
  return all.find(c => prefixOf(c) === prefix && c.slug === slug && c.active) ?? null
}
