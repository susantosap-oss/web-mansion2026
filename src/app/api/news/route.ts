import { NextResponse } from 'next/server'

const GAS_URL    = process.env.NEXT_PUBLIC_GAS_API_URL || ''
const GAS_SECRET = process.env.GAS_API_SECRET || 'mansion2026'

export async function POST(request: Request) {
  const body = await request.json()

  try {
    const url = new URL(GAS_URL)
    url.searchParams.set('action',    'saveNews')
    url.searchParams.set('secret',    GAS_SECRET)
    url.searchParams.set('Judul',     body.Judul     || body.judul     || '')
    url.searchParams.set('Kategori',  body.Kategori  || body.kategori  || 'Berita Properti')
    url.searchParams.set('Ringkasan', body.Ringkasan || body.ringkasan || '')
    url.searchParams.set('Konten',    body.Konten    || body.konten    || '')
    url.searchParams.set('foto_url',  body.foto_url  || '')

    const res  = await fetch(url.toString(), {
      method:   'GET',
      redirect: 'follow',   // ← ikuti redirect GAS
      signal:   AbortSignal.timeout(15000),
    })
    const text = await res.text()
    
    // Kalau HTML — GAS redirect belum selesai
    if (text.trim().startsWith('<')) {
      console.error('[api/news] GAS returned HTML:', text.slice(0, 100))
      return NextResponse.json({ success: false, error: 'GAS returned HTML — cek deployment GAS' }, { status: 500 })
    }

    const json = JSON.parse(text)
    return NextResponse.json(json)
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
