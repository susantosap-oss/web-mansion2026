import { NextResponse } from 'next/server'

const GAS_URL    = process.env.NEXT_PUBLIC_GAS_API_URL || ''
const GAS_SECRET = process.env.GAS_API_SECRET || 'mansion2026'

const localConfig = new Map<string, string>()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key') || ''

  if (localConfig.has(key))
    return NextResponse.json({ success: true, value: localConfig.get(key), source: 'local' })

  try {
    const url = new URL(GAS_URL)
    url.searchParams.set('action', 'getConfig')
    url.searchParams.set('key',    key)
    url.searchParams.set('secret', GAS_SECRET)
    const res  = await fetch(url.toString(), { cache: 'no-store', signal: AbortSignal.timeout(8000) })
    const json = await res.json()
    if (json.success) {
      const value = json.value ?? (json.data ? json.data[key] : null) ?? null
      if (value) localConfig.set(key, String(value))
      return NextResponse.json({ success: true, value, source: 'gas' })
    }
    return NextResponse.json({ success: true, value: null })
  } catch {
    return NextResponse.json({ success: true, value: null, source: 'fallback' })
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  const { key, value } = body

  if (!key)   return NextResponse.json({ success: false, error: 'key required' }, { status: 400 })
  if (!value) return NextResponse.json({ success: false, error: 'value required' }, { status: 400 })

  // Simpan ke memory
  localConfig.set(String(key), String(value))

  // Kirim ke GAS via GET — params di-encode otomatis oleh URLSearchParams
  let gasSaved = false
  let gasMsg   = ''
  try {
    const url = new URL(GAS_URL)
    url.searchParams.set('action', 'saveConfig')
    url.searchParams.set('secret', GAS_SECRET)
    url.searchParams.set('key',    String(key))
    url.searchParams.set('value',  String(value))   // URLSearchParams auto-encode

    console.log('[config POST] calling GAS:', url.toString().slice(0, 100))

    const res  = await fetch(url.toString(), {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    })
    const text = await res.text()
    console.log('[config POST] GAS response:', text.slice(0, 200))

    const json = JSON.parse(text)
    gasSaved   = json.success === true
    gasMsg     = json.message || json.error || ''
  } catch (e: any) {
    console.error('[config POST] GAS error:', e.message)
    gasMsg = e.message
  }

  return NextResponse.json({
    success: true,
    gasSaved,
    gasMsg,
    message: gasSaved
      ? '✅ Tersimpan ke Google Sheet!'
      : `✅ Tersimpan sementara (GAS: ${gasMsg})`,
  })
}
