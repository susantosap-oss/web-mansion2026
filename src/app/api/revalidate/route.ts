import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { clearCache } from '@/lib/gasCache'

export const dynamic = 'force-dynamic'

// Map action GAS → path Next.js + Data Cache tags yang perlu di-revalidate
const ACTION_PATHS: Record<string, string[]> = {
  getListings: ['/', '/listings'],
  getProjects: ['/', '/projects'],
  getAgents:   ['/agents'],
  getNews:     ['/', '/news'],
  all:         ['/', '/listings', '/projects', '/agents', '/news'],
}

// Tags fetch cache di sheets.ts: `gas:${action}`
const ACTION_TAGS: Record<string, string[]> = {
  getListings: ['gas:getListings', 'gas:getListingAgents'],
  getProjects: ['gas:getProjects'],
  getAgents:   ['gas:getAgents'],
  getNews:     ['gas:getNews'],
  all:         ['gas:getListings', 'gas:getListingAgents', 'gas:getProjects', 'gas:getAgents', 'gas:getNews'],
}

export async function POST(request: Request) {
  try {
    const body   = await request.json()
    const secret = body?.secret
    const action = body?.action || 'all'

    if (secret !== process.env.GAS_API_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Hapus in-memory cache (gasCache.ts store)
    clearCache()

    // 2. Invalidate Next.js Data Cache (fetch entries yang di-tag di sheets.ts)
    const tags = ACTION_TAGS[action] ?? ACTION_TAGS.all
    tags.forEach(t => revalidateTag(t))

    // 3. Invalidate Full Route Cache (pre-rendered HTML)
    const paths = ACTION_PATHS[action] ?? ACTION_PATHS.all
    paths.forEach(p => revalidatePath(p, 'layout'))

    return NextResponse.json({
      success:     true,
      action,
      revalidated: paths,
      tags,
      timestamp:   new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
