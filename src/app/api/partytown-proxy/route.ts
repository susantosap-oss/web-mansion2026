import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Daftar host yang boleh di-proxy (GA4 & GTM saja)
const ALLOWED_HOSTS = [
  'www.googletagmanager.com',
  'www.google-analytics.com',
  'analytics.google.com',
  'region1.google-analytics.com',
  'stats.g.doubleclick.net',
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const targetUrl = searchParams.get('url')

  if (!targetUrl) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

  try {
    const parsed = new URL(targetUrl)
    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
      return NextResponse.json({ error: 'Host not allowed' }, { status: 403 })
    }

    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0',
        'Accept':     request.headers.get('accept')     || '*/*',
      },
    })

    const body = await res.arrayBuffer()
    return new NextResponse(body, {
      status: res.status,
      headers: {
        'Content-Type':                res.headers.get('content-type') || 'application/javascript',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control':               'public, max-age=3600',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 })
  }
}
