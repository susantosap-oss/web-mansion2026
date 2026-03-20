import { NextResponse } from 'next/server'

function sanitize(v: unknown): string {
  if (v === undefined || v === null) return ''
  const s = String(v).trim()
  // Cegah Google Sheets formula injection
  return s.startsWith('=') || s.startsWith('+') || s.startsWith('-') || s.startsWith('@')
    ? "'" + s
    : s
}

function gasUrl() {
  const url    = process.env.NEXT_PUBLIC_GAS_API_URL
  const secret = process.env.GAS_API_SECRET
  if (!url || url.includes('GANTI') || !secret) return null
  return { url, secret }
}

export async function GET(request: Request) {
  const gas = gasUrl()
  if (!gas) return NextResponse.json({ success: true, data: [], note: 'GAS URL belum dikonfigurasi' })

  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId') || ''

    const u = new URL(gas.url)
    u.searchParams.set('action', 'getLeads')
    u.searchParams.set('secret', gas.secret)
    if (agentId) u.searchParams.set('agentId', agentId)

    const res  = await fetch(u.toString(), { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(15000) })
    const text = await res.text()
    if (text.trim().startsWith('<'))
      return NextResponse.json({ success: false, error: 'GAS error' }, { status: 500 })

    return NextResponse.json(JSON.parse(text))
  } catch {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const name  = sanitize(body.name)
    const phone = sanitize(body.phone)
    if (!name || !phone)
      return NextResponse.json({ success: false, error: 'name & phone wajib' }, { status: 400 })

    const gas = gasUrl()
    if (!gas)
      return NextResponse.json({ success: true, note: 'GAS URL belum dikonfigurasi, lead tidak disimpan' })

    // Kirim via GET params — hindari POST redirect body hilang di GAS
    const u = new URL(gas.url)
    u.searchParams.set('action',       'saveLead')
    u.searchParams.set('secret',       gas.secret)
    u.searchParams.set('name',         name)
    u.searchParams.set('phone',        phone)
    u.searchParams.set('email',        sanitize(body.email))
    u.searchParams.set('listingId',    sanitize(body.listingId))
    u.searchParams.set('listingTitle', sanitize(body.listingTitle))
    u.searchParams.set('agentId',      sanitize(body.agentId))
    u.searchParams.set('message',      sanitize(body.message))
    u.searchParams.set('source',       sanitize(body.source) || 'Web')
    u.searchParams.set('tipeProperti', sanitize(body.tipeProperti))
    u.searchParams.set('jenis',        sanitize(body.jenis))
    u.searchParams.set('minatTipe',    sanitize(body.minatTipe))
    u.searchParams.set('lokasi',       sanitize(body.lokasi))
    u.searchParams.set('budgetMin',    sanitize(body.budgetMin))
    u.searchParams.set('budgetMax',    sanitize(body.budgetMax))

    const res  = await fetch(u.toString(), { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(15000) })
    const text = await res.text()
    if (text.trim().startsWith('<'))
      return NextResponse.json({ success: false, error: 'GAS error — cek deployment GAS' }, { status: 500 })

    return NextResponse.json(JSON.parse(text))
  } catch {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body    = await request.json()
    const leadId  = sanitize(body.leadId)
    const status  = sanitize(body.status)

    if (!leadId || !status)
      return NextResponse.json({ success: false, error: 'leadId & status wajib' }, { status: 400 })

    const VALID_STATUS = ['Baru', 'Dihubungi', 'Warm', 'Qualified', 'Closing', 'Batal']
    if (!VALID_STATUS.includes(status))
      return NextResponse.json({ success: false, error: 'Status tidak valid' }, { status: 400 })

    const gas = gasUrl()
    if (!gas)
      return NextResponse.json({ success: true, note: 'GAS URL belum dikonfigurasi' })

    const u = new URL(gas.url)
    u.searchParams.set('action', 'updateLeadStatus')
    u.searchParams.set('secret', gas.secret)
    u.searchParams.set('leadId', leadId)
    u.searchParams.set('status', status)

    const res  = await fetch(u.toString(), { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(15000) })
    const text = await res.text()
    if (text.trim().startsWith('<'))
      return NextResponse.json({ success: false, error: 'GAS error' }, { status: 500 })

    return NextResponse.json(JSON.parse(text))
  } catch {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}
