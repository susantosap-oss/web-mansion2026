import { NextResponse } from 'next/server'
export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.name || !body.phone) return NextResponse.json({ success: false, error: 'name & phone wajib' }, { status: 400 })

    const GAS_URL = process.env.NEXT_PUBLIC_GAS_API_URL
    if (!GAS_URL || GAS_URL.includes('GANTI')) return NextResponse.json({ success: true, note: 'GAS URL belum dikonfigurasi, lead tidak disimpan' })

    const url = new URL(GAS_URL)
    url.searchParams.set('action', 'saveLead')
    url.searchParams.set('secret', process.env.GAS_API_SECRET || '')
    const res = await fetch(url.toString(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, createdAt: new Date().toISOString(), status: 'New' }) })
    return NextResponse.json(await res.json())
  } catch { return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 }) }
}
