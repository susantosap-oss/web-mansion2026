import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const cache = new Map<string, { data: unknown; expiresAt: number }>()

const SENSITIVE_COLS = ['Password_Hash', 'Password', 'Telegram_ID']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  if (!action)
    return NextResponse.json({ success: false, error: 'action required' }, { status: 400 })

  const cached = cache.get(action)
  if (cached && Date.now() < cached.expiresAt)
    return NextResponse.json({ success: true, data: cached.data, cached: true })

  const GAS_URL = process.env.NEXT_PUBLIC_GAS_API_URL
  if (!GAS_URL || GAS_URL.includes('GANTI'))
    return NextResponse.json({ success: true, data: [], note: 'GAS URL belum dikonfigurasi' })

  try {
    const url = new URL(GAS_URL)
    url.searchParams.set('action', action)
    url.searchParams.set('secret', process.env.GAS_API_SECRET || '')

    const res  = await fetch(url.toString(), { cache: 'no-store' })
    const json = await res.json()

    // Strip kolom sensitif sebelum dikirim ke client
    if (json.success && action === 'getAgents' && Array.isArray(json.data)) {
      json.data = json.data.map((row: any) => {
        const safe = { ...row }
        SENSITIVE_COLS.forEach(col => delete safe[col])
        return safe
      })
    }

    if (json.success)
      cache.set(action, { data: json.data, expiresAt: Date.now() + 300_000 })

    return NextResponse.json(json)
  } catch (e) {
    return NextResponse.json({ success: false, error: 'GAS fetch failed' }, { status: 500 })
  }
}
