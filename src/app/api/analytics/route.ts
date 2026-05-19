import { NextResponse } from 'next/server'
import crypto from 'crypto'

// ── JWT helper untuk Service Account Google ───────────────
function base64url(str: string | Buffer): string {
  const b = typeof str === 'string' ? Buffer.from(str) : str
  return b.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function getAccessToken(serviceAccountJson: string): Promise<string> {
  const sa = JSON.parse(serviceAccountJson)
  const now = Math.floor(Date.now() / 1000)

  const header  = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = base64url(JSON.stringify({
    iss:   sa.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud:   'https://oauth2.googleapis.com/token',
    exp:   now + 3600,
    iat:   now,
  }))

  const signInput = `${header}.${payload}`
  const key       = crypto.createPrivateKey(sa.private_key)
  const sig       = crypto.sign('sha256', Buffer.from(signInput), key)
  const jwt       = `${signInput}.${base64url(sig)}`

  const tokenRes  = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  })
  const tokenJson = await tokenRes.json()
  if (!tokenJson.access_token) throw new Error('Gagal mendapat access token GA4')
  return tokenJson.access_token
}

// ── GA4 Data API helper ───────────────────────────────────
async function runReport(token: string, propertyId: string, body: object) {
  const res  = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  )
  return res.json()
}

function rowsToMap(report: { rows?: Array<{ dimensionValues: Array<{ value: string }>; metricValues: Array<{ value: string }> }> }): Record<string, number> {
  const map: Record<string, number> = {}
  for (const row of (report.rows ?? [])) {
    const dim = row.dimensionValues[0]?.value ?? ''
    const val = parseInt(row.metricValues[0]?.value ?? '0', 10)
    map[dim] = val
  }
  return map
}

export async function GET() {
  const propertyId = process.env.GA4_PROPERTY_ID
  const saB64      = process.env.GA4_SERVICE_ACCOUNT_B64

  if (!propertyId || !saB64) {
    return NextResponse.json({ configured: false, message: 'GA4 belum dikonfigurasi. Set GA4_PROPERTY_ID & GA4_SERVICE_ACCOUNT_B64 di env.' })
  }

  // Decode base64 → JSON string (hindari masalah karakter spesial di env var)
  const saJson = Buffer.from(saB64, 'base64').toString('utf-8')

  try {
    const token = await getAccessToken(saJson)

    // ── 3 periode traffic ─────────────────────────────────
    const today  = new Date()
    const fmt    = (d: Date) => d.toISOString().split('T')[0]
    const sub    = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() - n); return x }

    const [daily, weekly, monthly] = await Promise.all([
      runReport(token, propertyId, {
        dateRanges: [{ startDate: fmt(sub(today, 1)), endDate: 'today' }],
        metrics:    [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }],
      }),
      runReport(token, propertyId, {
        dateRanges: [{ startDate: fmt(sub(today, 7)), endDate: 'today' }],
        metrics:    [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }],
      }),
      runReport(token, propertyId, {
        dateRanges: [{ startDate: fmt(sub(today, 30)), endDate: 'today' }],
        metrics:    [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }],
      }),
    ])

    function extractMetrics(r: { totals?: Array<{ metricValues: Array<{ value: string }> }> }) {
      const t = r.totals?.[0]?.metricValues ?? []
      return {
        activeUsers:     parseInt(t[0]?.value ?? '0', 10),
        sessions:        parseInt(t[1]?.value ?? '0', 10),
        pageViews:       parseInt(t[2]?.value ?? '0', 10),
      }
    }

    // ── Top cities (Surabaya, Gresik, Sidoarjo, Malang) ──
    const cityReport = await runReport(token, propertyId, {
      dateRanges:  [{ startDate: fmt(sub(today, 30)), endDate: 'today' }],
      dimensions:  [{ name: 'city' }],
      metrics:     [{ name: 'activeUsers' }],
      orderBys:    [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit:       20,
    })
    const cityMap = rowsToMap(cityReport)
    const targetCities = ['Surabaya', 'Gresik', 'Sidoarjo', 'Malang', 'Mojokerto', 'Lamongan']
    const cities = targetCities.map(c => ({ city: c, users: cityMap[c] ?? 0 }))

    // ── Top pages / property types ────────────────────────
    const pageReport = await runReport(token, propertyId, {
      dateRanges: [{ startDate: fmt(sub(today, 30)), endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics:    [{ name: 'screenPageViews' }],
      orderBys:   [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit:      50,
    })

    const propTypes = ['Rumah', 'Ruko', 'Kavling', 'Gudang', 'Apartemen', 'Gedung']
    const typeCounts = propTypes.map(pt => {
      const kw  = pt.toLowerCase()
      const cnt = (pageReport.rows ?? []).filter((r: { dimensionValues: Array<{ value: string }> }) =>
        r.dimensionValues[0]?.value?.toLowerCase().includes(kw)
      ).reduce((s: number, r: { metricValues: Array<{ value: string }> }) => s + parseInt(r.metricValues[0]?.value ?? '0', 10), 0)
      return { type: pt, views: cnt }
    }).sort((a, b) => b.views - a.views)

    // ── Top pages (10 terbanyak) ──────────────────────────
    const topPages = (pageReport.rows ?? []).slice(0, 10).map((r: { dimensionValues: Array<{ value: string }>; metricValues: Array<{ value: string }> }) => ({
      path:  r.dimensionValues[0]?.value ?? '',
      views: parseInt(r.metricValues[0]?.value ?? '0', 10),
    }))

    return NextResponse.json({
      configured: true,
      daily:      extractMetrics(daily),
      weekly:     extractMetrics(weekly),
      monthly:    extractMetrics(monthly),
      cities,
      typeCounts,
      topPages,
      updatedAt:  new Date().toISOString(),
    })
  } catch (e: unknown) {
    return NextResponse.json({ configured: true, error: (e instanceof Error ? e.message : String(e)) }, { status: 500 })
  }
}
