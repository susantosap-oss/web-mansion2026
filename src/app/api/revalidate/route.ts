import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { clearCache } from '@/lib/gasCache'

export const dynamic = 'force-dynamic'

// Map action GAS → path Next.js yang perlu di-revalidate
const ACTION_PATHS: Record<string, string[]> = {
  getListings: ['/', '/listings'],
  getProjects: ['/', '/projects'],
  getAgents:   ['/agents'],
  getNews:     ['/', '/news'],
  all:         ['/', '/listings', '/projects', '/agents', '/news'],
}

export async function POST(request: Request) {
  try {
    const body   = await request.json()
    const secret = body?.secret
    const action = body?.action || 'all'

    if (secret !== process.env.GAS_API_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Hapus in-memory cache (sheets.ts + api/sheets/route.ts pakai store yang sama)
    clearCache()

    // Invalidate Next.js ISR / fetch cache untuk path terkait
    const paths = ACTION_PATHS[action] ?? ACTION_PATHS.all
    paths.forEach(p => revalidatePath(p))

    return NextResponse.json({
      success:    true,
      action,
      revalidated: paths,
      timestamp:  new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
