import { NextRequest, NextResponse } from 'next/server'

const GAS_URL    = process.env.NEXT_PUBLIC_GAS_API_URL!
const GAS_SECRET = process.env.GAS_API_SECRET || ''

/**
 * POST /api/listing-events
 * Body: { listingId, type: 'view'|'share', source: 'web'|'crm' }
 * → Calls GAS action `trackListingEvent` (stores to LISTING_EVENTS sheet)
 *
 * GAS LISTING_EVENTS sheet columns:
 * ID | Listing_ID | Type | Source | Timestamp
 */
export async function POST(req: NextRequest) {
  try {
    const { listingId, type, source } = await req.json()
    if (!listingId || !type) return NextResponse.json({ ok: false }, { status: 400 })
    if (!['view', 'share'].includes(type)) return NextResponse.json({ ok: false }, { status: 400 })

    if (GAS_URL && !GAS_URL.includes('GANTI')) {
      const gasUrl = new URL(GAS_URL)
      gasUrl.searchParams.set('action', 'trackListingEvent')
      gasUrl.searchParams.set('secret', GAS_SECRET)
      gasUrl.searchParams.set('listingId', String(listingId))
      gasUrl.searchParams.set('type', type)
      gasUrl.searchParams.set('source', source || 'web')
      gasUrl.searchParams.set('ts', new Date().toISOString())
      // Fire-and-forget — jangan block response
      fetch(gasUrl.toString()).catch(() => {})
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

/**
 * GET /api/listing-events?listingIds=L001,L002
 * → Calls GAS action `getListingStats`
 * → Returns: { data: { [listingId]: { views7d, views30d, shares7d, shares30d } } }
 *
 * GAS action `getListingStats` menerima listingIds (comma-separated)
 * dan mengembalikan agregasi count per period dari LISTING_EVENTS sheet.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const listingIds = searchParams.get('listingIds') || ''
    if (!listingIds) return NextResponse.json({ data: {} })

    if (!GAS_URL || GAS_URL.includes('GANTI')) {
      return NextResponse.json({ data: {} })
    }

    const gasUrl = new URL(GAS_URL)
    gasUrl.searchParams.set('action', 'getListingStats')
    gasUrl.searchParams.set('secret', GAS_SECRET)
    gasUrl.searchParams.set('listingIds', listingIds)

    const res = await fetch(gasUrl.toString(), { cache: 'no-store' })
    if (!res.ok) return NextResponse.json({ data: {} })

    const json = await res.json()
    return NextResponse.json({ data: json.data || {} })
  } catch {
    return NextResponse.json({ data: {} })
  }
}
