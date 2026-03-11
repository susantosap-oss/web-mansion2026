import { NextResponse } from 'next/server'

const GAS_URL    = process.env.NEXT_PUBLIC_GAS_API_URL || ''
const GAS_SECRET = process.env.GAS_API_SECRET || 'mansion2026'

// In-memory fallback kalau GAS belum support saveConfig
const localConfig = new Map<string, string>()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key') || ''

  if (localConfig.has(key))
    return NextResponse.json({ success: true, value: localConfig.get(key), source: 'local' })

  try {
    const url = new URL(GAS_URL)
    url.searchParams.set('action', 'getConfig')
    url.searchParams.set('key', key)
    url.searchParams.set('secret', GAS_SECRET)
    const res  = await fetch(url.toString(), { cache: 'no-store', signal: AbortSignal.timeout(5000) })
    const json = await res.json()
    if (json.success && json.value) {
      localConfig.set(key, json.value)
      return NextResponse.json({ success: true, value: json.value, source: 'gas' })
    }
    return NextResponse.json({ success: true, value: null })
  } catch {
    return NextResponse.json({ success: true, value: null, source: 'fallback' })
  }
}

export async function POST(request: Request) {
  const { key, value } = await request.json()
  if (!key) return NextResponse.json({ success: false, error: 'key required' }, { status: 400 })

  // Simpan ke memory dulu
  localConfig.set(key, value)

  // Coba ke GAS
  let gasSaved = false
  try {
    const url = new URL(GAS_URL)
    url.searchParams.set('action', 'saveConfig')
    url.searchParams.set('secret', GAS_SECRET)
    const res  = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value, secret: GAS_SECRET }),
      signal: AbortSignal.timeout(5000),
    })
    const json = await res.json()
    gasSaved   = json.success
  } catch {}

  return NextResponse.json({
    success: true,
    gasSaved,
    message: gasSaved
      ? '✅ Tersimpan ke Google Sheet'
      : '✅ Tersimpan sementara (tambahkan saveConfig di GAS untuk permanen)',
  })
}
