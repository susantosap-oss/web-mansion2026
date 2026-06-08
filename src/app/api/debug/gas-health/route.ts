import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const ACTIONS = ['getListings', 'getAgents', 'getNews', 'getProjects']

export async function GET() {
  const GAS_URL = process.env.NEXT_PUBLIC_GAS_API_URL
  const SECRET  = process.env.GAS_API_SECRET || ''

  if (!GAS_URL || GAS_URL.includes('GANTI')) {
    return NextResponse.json({ ok: false, error: 'GAS_URL tidak dikonfigurasi' }, { status: 500 })
  }

  const results: Record<string, { ok: boolean; count?: number; error?: string; ms: number }> = {}

  for (const action of ACTIONS) {
    const url = new URL(GAS_URL)
    url.searchParams.set('action', action)
    url.searchParams.set('secret', SECRET)

    const t0 = Date.now()
    try {
      const res  = await fetch(url.toString(), { cache: 'no-store' })
      const text = await res.text()
      const ms   = Date.now() - t0

      if (text.trimStart().startsWith('<')) {
        results[action] = { ok: false, error: 'ACCESS_DENIED — deployment tidak aktif', ms }
        continue
      }

      const json = JSON.parse(text)
      results[action] = json.success
        ? { ok: true, count: Array.isArray(json.data) ? json.data.length : undefined, ms }
        : { ok: false, error: json.error || 'GAS returned success:false', ms }
    } catch (e: any) {
      results[action] = { ok: false, error: e.message, ms: Date.now() - t0 }
    }
  }

  const allOk = Object.values(results).every(r => r.ok)
  return NextResponse.json({ ok: allOk, gasUrl: GAS_URL.slice(0, 60) + '…', results }, {
    status: allOk ? 200 : 503,
  })
}
