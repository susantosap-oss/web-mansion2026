import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createToken, verifyToken, COOKIE_NAME, AuthUser } from '@/lib/auth'

const GAS_URL    = process.env.NEXT_PUBLIC_GAS_API_URL || ''
const GAS_SECRET = process.env.GAS_API_SECRET || 'mansion2026'

export async function POST(request: Request) {
  const { email, password } = await request.json()
  if (!email || !password)
    return NextResponse.json({ success: false, error: 'Email & password wajib diisi' }, { status: 400 })

  try {
    const url = new URL(GAS_URL)
    url.searchParams.set('action', 'getAgents')
    url.searchParams.set('secret', GAS_SECRET)
    const res    = await fetch(url.toString(), { cache: 'no-store' })
    const json   = await res.json()
    const agents: any[] = json.data || []

    const agent = agents.find((a: any) =>
      String(a['Email'] || '').toLowerCase() === email.toLowerCase()
    )
    if (!agent)
      return NextResponse.json({ success: false, error: 'Email tidak ditemukan' }, { status: 401 })

    const status = String(agent['Status'] || '').toLowerCase()
    if (status === 'inactive' || status === 'resigned')
      return NextResponse.json({ success: false, error: 'Akun tidak aktif' }, { status: 403 })

    // ── Verifikasi password — support bcrypt hash & plain text ──
    const storedHash = String(agent['Password_Hash'] || '')
    let passwordValid = false

    if (storedHash.startsWith('$2')) {
      // bcrypt hash (dari CRM)
      passwordValid = await bcrypt.compare(password, storedHash)
    } else if (storedHash) {
      // plain text fallback (lama)
      passwordValid = storedHash === password
    } else {
      // kolom kosong = akses ditolak
      passwordValid = false
    }

    if (!passwordValid)
      return NextResponse.json({ success: false, error: 'Password salah' }, { status: 401 })

    const rawRole = String(agent['Role'] || 'agent').toLowerCase().trim()
    let role: AuthUser['role'] = 'agent'
    if (rawRole === 'superadmin' || rawRole === 'principal') role = 'superadmin'
    else if (rawRole === 'admin') role = 'admin'

    const user: AuthUser = {
      id:      String(agent['ID'] || ''),
      name:    String(agent['Nama'] || email),
      email,
      role,
      agentId: String(agent['ID'] || ''),
      photo:   String(agent['Foto_URL'] || ''),
    }

    const token    = createToken(user)
    const response = NextResponse.json({ success: true, user })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   7 * 24 * 60 * 60,
      path:     '/',
    })
    return response
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(COOKIE_NAME)
  return response
}

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
  if (!match) return NextResponse.json({ success: false, user: null })
  const user = verifyToken(match[1])
  return NextResponse.json({ success: !!user, user })
}
