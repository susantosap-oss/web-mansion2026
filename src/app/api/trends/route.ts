import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

const CURATED: Record<string, { top: TrendItem[]; rising: TrendItem[] }> = {
  Rumah: {
    top: [
      { query: 'rumah dijual surabaya', value: 100 },
      { query: 'rumah murah surabaya', value: 88 },
      { query: 'rumah KPR surabaya', value: 82 },
      { query: 'rumah subsidi jawa timur', value: 75 },
      { query: 'jual rumah malang', value: 68 },
      { query: 'rumah minimalis surabaya', value: 61 },
      { query: 'rumah second surabaya', value: 54 },
      { query: 'rumah sidoarjo murah', value: 47 },
    ],
    rising: [
      { query: 'rumah green living surabaya', value: 350 },
      { query: 'rumah cluster surabaya 2026', value: 290 },
      { query: 'rumah smart home surabaya', value: 240 },
      { query: 'rumah bebas banjir surabaya', value: 210 },
      { query: 'rumah dekat tol surabaya', value: 180 },
    ],
  },
  Ruko: {
    top: [
      { query: 'ruko dijual surabaya', value: 100 },
      { query: 'ruko murah surabaya', value: 85 },
      { query: 'ruko strategis surabaya', value: 72 },
      { query: 'ruko dijual malang', value: 64 },
      { query: 'ruko sidoarjo', value: 58 },
      { query: 'sewa ruko surabaya', value: 52 },
      { query: 'ruko 2 lantai surabaya', value: 45 },
      { query: 'ruko pusat kota surabaya', value: 38 },
    ],
    rising: [
      { query: 'ruko modern surabaya 2026', value: 400 },
      { query: 'ruko dekat tol surabaya', value: 310 },
      { query: 'ruko komersial surabaya', value: 260 },
      { query: 'ruko investasi surabaya', value: 220 },
      { query: 'ruko ready stok surabaya', value: 175 },
    ],
  },
}

export interface TrendItem { query: string; value: number }
export interface TrendResult {
  keyword: string
  top:     TrendItem[]
  rising:  TrendItem[]
}

async function fetchRelatedQueries(keyword: string, geo: string): Promise<{ top: TrendItem[]; rising: TrendItem[] }> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const googleTrends = require('google-trends-api')
  const raw = await googleTrends.relatedQueries({
    keyword,
    geo,
    startTime: new Date(Date.now() - 90 * 24 * 3600 * 1000),
  })
  const parsed = JSON.parse(raw)
  const rankedList   = parsed?.default?.rankedList ?? []
  const topRanked    = rankedList[0]?.rankedKeyword ?? []
  const risingRanked = rankedList[1]?.rankedKeyword ?? []

  const map = (arr: Array<{ query: string; value: number }>) =>
    arr.slice(0, 8).map(r => ({ query: r.query, value: r.value }))

  return { top: map(topRanked), rising: map(risingRanked) }
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'superadmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const geo      = searchParams.get('geo')      || 'ID-JI'
  const kwParam  = searchParams.get('keywords') || 'Rumah,Ruko'
  const keywords = kwParam.split(',').map(k => k.trim()).filter(Boolean).slice(0, 5)

  const results: TrendResult[] = []
  let source = 'google'

  for (const kw of keywords) {
    try {
      const data = await fetchRelatedQueries(kw, geo)
      results.push({ keyword: kw, ...data })
    } catch {
      const fallback = CURATED[kw]
      results.push({ keyword: kw, ...(fallback ?? { top: [], rising: [] }) })
      source = 'curated'
    }
  }

  return NextResponse.json({ success: true, data: results, source, geo })
}
