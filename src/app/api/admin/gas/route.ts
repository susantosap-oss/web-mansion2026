import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { clearCache } from '@/lib/gasCache'
import { revalidatePath, revalidateTag } from 'next/cache'

export const dynamic = 'force-dynamic'

const GAS_URL    = process.env.NEXT_PUBLIC_GAS_API_URL || ''
const GAS_SECRET = process.env.GAS_API_SECRET         || ''

const ALL_TAGS  = ['gas:getListings','gas:getListingAgents','gas:getProjects','gas:getAgents','gas:getNews','gas:getAssets']
const ALL_PATHS = ['/', '/listings', '/projects', '/agents', '/news', '/asset-bank']

function requireAdmin() {
  try {
    const s = getSession()
    return (s?.role === 'admin' || s?.role === 'superadmin') ? s : null
  } catch { return null }
}

function flushCache() {
  clearCache()
  ALL_TAGS.forEach(t  => revalidateTag(t))
  ALL_PATHS.forEach(p => revalidatePath(p, 'layout'))
}

// GET /api/admin/gas — cek status trigger GAS
export async function GET() {
  if (!requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const res  = await fetch(`${GAS_URL}?secret=${GAS_SECRET}&action=getTriggerStatus`, { cache: 'no-store' })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) })
  }
}

// POST /api/admin/gas — { action: 'revalidate' | 'reinit' }
export async function POST(req: Request) {
  if (!requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action } = await req.json().catch(() => ({ action: 'revalidate' }))

  if (action === 'revalidate') {
    flushCache()
    return NextResponse.json({ success: true, action: 'revalidate', timestamp: new Date().toISOString() })
  }

  if (action === 'reinit') {
    let gasResult: Record<string, unknown> = {}
    try {
      const gasRes = await fetch(`${GAS_URL}?secret=${GAS_SECRET}&action=reinitTriggers`, { cache: 'no-store' })
      gasResult = await gasRes.json()
    } catch (e) {
      gasResult = { success: false, error: String(e) }
    }
    flushCache()
    return NextResponse.json({ success: true, action: 'reinit', gas: gasResult, timestamp: new Date().toISOString() })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
