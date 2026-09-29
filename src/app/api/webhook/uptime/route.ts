import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FONNTE_TOKEN = process.env.FONNTE_TOKEN || ''
const WA_TARGET    = process.env.NEXT_PUBLIC_WA_OFFICE || ''
const SITE_NAME    = 'MANSION Realty Web'

async function sendWA(message: string) {
  if (!FONNTE_TOKEN || !WA_TARGET) return

  await fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: { 'TOKEN': FONNTE_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: WA_TARGET, message }),
  })
}

// UptimeRobot kirim POST form-urlencoded ke URL ini
export async function POST(req: Request) {
  try {
    const ct   = req.headers.get('content-type') || ''
    let params: Record<string, string> = {}

    if (ct.includes('application/json')) {
      params = await req.json()
    } else {
      // form-urlencoded (default UptimeRobot)
      const text = await req.text()
      text.split('&').forEach(pair => {
        const [k, v] = pair.split('=')
        if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || '')
      })
    }

    const status  = params.monitorStatus       || params.status || ''
    const url     = params.monitorURL          || params.url    || ''
    const name    = params.monitorFriendlyName || params.name   || SITE_NAME
    const details = params.alertDetails        || ''
    const isDown  = status.toLowerCase() === 'down'

    const message = isDown
      ? `⚠️ *${name} DOWN*\n📍 ${url}\n🕐 ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n${details ? `\nDetail: ${details}` : ''}`
      : `✅ *${name} PULIH*\n📍 ${url}\n🕐 ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`

    await sendWA(message)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[uptime-webhook]', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
