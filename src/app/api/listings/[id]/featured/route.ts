import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { clearCache } from '@/lib/gasCache'

const GAS_URL    = process.env.NEXT_PUBLIC_GAS_API_URL!
const GAS_SECRET = process.env.GAS_API_SECRET || ''

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  let session = null
  try { session = getSession() } catch {}

  if (!session || (session.role !== 'superadmin' && session.role !== 'admin'))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { featured } = await req.json()

  const url = new URL(GAS_URL)
  url.searchParams.set('action',    'setFeatured')
  url.searchParams.set('secret',    GAS_SECRET)
  url.searchParams.set('listingId', params.id)
  url.searchParams.set('featured',  String(!!featured))

  const res  = await fetch(url.toString(), { cache: 'no-store' })
  const json = await res.json()

  if (!json.success) return NextResponse.json({ error: json.error }, { status: 400 })

  clearCache('gas:getListings')
  return NextResponse.json({ success: true })
}
