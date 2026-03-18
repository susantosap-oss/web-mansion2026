import { NextResponse } from 'next/server'

function sanitize(v: unknown): string {
  if (v === undefined || v === null) return ''
  const s = String(v).trim()
  // Cegah Google Sheets formula injection
  return s.startsWith('=') || s.startsWith('+') || s.startsWith('-') || s.startsWith('@')
    ? "'" + s
    : s
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const name  = sanitize(body.name)
    const phone = sanitize(body.phone)
    if (!name || !phone)
      return NextResponse.json({ success: false, error: 'name & phone wajib' }, { status: 400 })

    const GAS_URL    = process.env.NEXT_PUBLIC_GAS_API_URL
    const GAS_SECRET = process.env.GAS_API_SECRET
    if (!GAS_URL || GAS_URL.includes('GANTI') || !GAS_SECRET)
      return NextResponse.json({ success: true, note: 'GAS URL belum dikonfigurasi, lead tidak disimpan' })

    // Kirim via GET params — hindari POST redirect body hilang di GAS
    const url = new URL(GAS_URL)
    url.searchParams.set('action',       'saveLead')
    url.searchParams.set('secret',       GAS_SECRET)
    url.searchParams.set('name',         name)
    url.searchParams.set('phone',        phone)
    url.searchParams.set('email',        sanitize(body.email))
    url.searchParams.set('listingId',    sanitize(body.listingId))
    url.searchParams.set('listingTitle', sanitize(body.listingTitle))
    url.searchParams.set('agentId',      sanitize(body.agentId))
    url.searchParams.set('message',      sanitize(body.message))
    url.searchParams.set('source',       sanitize(body.source) || 'Web')
    url.searchParams.set('tipeProperti', sanitize(body.tipeProperti))
    url.searchParams.set('jenis',        sanitize(body.jenis))
    url.searchParams.set('minatTipe',    sanitize(body.minatTipe))
    url.searchParams.set('lokasi',       sanitize(body.lokasi))
    url.searchParams.set('budgetMin',    sanitize(body.budgetMin))
    url.searchParams.set('budgetMax',    sanitize(body.budgetMax))

    const res = await fetch(url.toString(), {
      method:   'GET',
      redirect: 'follow',
      signal:   AbortSignal.timeout(15000),
    })
    const text = await res.text()
    if (text.trim().startsWith('<'))
      return NextResponse.json({ success: false, error: 'GAS error — cek deployment GAS' }, { status: 500 })

    return NextResponse.json(JSON.parse(text))
  } catch {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}
