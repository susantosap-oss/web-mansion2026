import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export interface TrendItem   { query: string; value: number }
export interface TrendResult { keyword: string; top: TrendItem[]; rising: TrendItem[] }

// Geo code → nama kota utama
const GEO_CITY: Record<string, string> = {
  'ID-JI': 'Surabaya', 'ID-JK': 'Jakarta',   'ID-JB': 'Bandung',
  'ID-JT': 'Semarang', 'ID-BA': 'Denpasar',  'ID-SU': 'Medan',
  'ID-SS': 'Palembang','ID-SN': 'Makassar',  'ID-KS': 'Banjarmasin',
  'ID':    'Indonesia',
}

// Fallback dinamis — generate berdasarkan keyword + kota
function buildCurated(kw: string, city: string): { top: TrendItem[]; rising: TrendItem[] } {
  const k = kw.toLowerCase()
  const top: TrendItem[] = [
    { query: `${k} dijual ${city.toLowerCase()}`,       value: 100 },
    { query: `${k} murah ${city.toLowerCase()}`,        value: 85  },
    { query: `${k} KPR ${city.toLowerCase()}`,          value: 74  },
    { query: `jual ${k} ${city.toLowerCase()}`,         value: 68  },
    { query: `harga ${k} ${city.toLowerCase()}`,        value: 60  },
    { query: `${k} second ${city.toLowerCase()}`,       value: 52  },
    { query: `${k} subsidi ${city.toLowerCase()}`,      value: 44  },
    { query: `sewa ${k} ${city.toLowerCase()}`,         value: 37  },
  ]
  const rising: TrendItem[] = [
    { query: `${k} ${city.toLowerCase()} 2026`,         value: 380 },
    { query: `${k} ready stok ${city.toLowerCase()}`,   value: 290 },
    { query: `${k} strategis ${city.toLowerCase()}`,    value: 230 },
    { query: `${k} investasi ${city.toLowerCase()}`,    value: 190 },
    { query: `${k} dekat tol ${city.toLowerCase()}`,    value: 150 },
  ]
  return { top, rising }
}

async function fetchRelatedQueries(
  keyword: string, geo: string
): Promise<{ top: TrendItem[]; rising: TrendItem[] }> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const googleTrends = require('google-trends-api')
  const raw    = await googleTrends.relatedQueries({
    keyword,
    geo,
    startTime: new Date(Date.now() - 90 * 24 * 3600 * 1000),
  })
  const parsed      = JSON.parse(raw)
  const rankedList  = parsed?.default?.rankedList ?? []
  const topRanked   = rankedList[0]?.rankedKeyword ?? []
  const risingRanked= rankedList[1]?.rankedKeyword ?? []

  const map = (arr: Array<{ query: string; value: number }>) =>
    arr.slice(0, 8).map(r => ({ query: r.query, value: r.value }))

  const top    = map(topRanked)
  const rising = map(risingRanked)

  // Google memblok request → kembalikan data kosong tanpa error
  // Paksa fallback dengan throw agar catch menangani
  if (top.length === 0 && rising.length === 0) {
    throw new Error('Google Trends returned empty (likely blocked)')
  }
  return { top, rising }
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
  const city     = GEO_CITY[geo] || 'Indonesia'

  const results: TrendResult[] = []
  let source = 'google'

  for (const kw of keywords) {
    try {
      const data = await fetchRelatedQueries(kw, geo)
      results.push({ keyword: kw, ...data })
    } catch {
      results.push({ keyword: kw, ...buildCurated(kw, city) })
      source = 'curated'
    }
  }

  return NextResponse.json({ success: true, data: results, source, geo, city })
}
