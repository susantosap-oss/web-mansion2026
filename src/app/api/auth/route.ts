import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { google } from 'googleapis'
import { createToken, verifyToken, COOKIE_NAME, AuthUser } from '@/lib/auth'

const GAS_URL    = process.env.NEXT_PUBLIC_GAS_API_URL || ''
const GAS_SECRET = process.env.GAS_API_SECRET || ''

// ── Baca row AGENTS langsung dari Google Sheets API (sama persis dgn CRM) ──
async function getAgentRowByEmail(email: string): Promise<string[] | null> {
  const sheetId = process.env.GOOGLE_SHEETS_ID
  if (!sheetId) return null

  try {
    // Gunakan service account eksplisit jika ada, atau ADC (Cloud Run service account)
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const privateKey  = process.env.GOOGLE_PRIVATE_KEY
    const auth = (clientEmail && privateKey)
      ? new google.auth.JWT({
          email: clientEmail,
          key:   privateKey.replace(/\\n/g, '\n'),
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        })
      : new google.auth.GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        })

    const sheets = google.sheets({ version: 'v4', auth: auth as any })
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'AGENTS',
    })
    const rows: string[][] = (res.data.values || []) as string[][]
    // Skip header row, cari by email (kolom C = index 2)
    return rows.slice(1).find(r => (r[2] || '').toLowerCase() === email.toLowerCase()) || null
  } catch (e: any) {
    console.error('[auth] Sheets API error:', e.message)
    return null
  }
}

// Kolom AGENTS sesuai CRM config (A=0, B=1, C=2, D=3, ...)
const COL = {
  ID: 0, NAMA: 1, EMAIL: 2, PASSWORD_HASH: 3, NO_WA: 4,
  ROLE: 5, STATUS: 6, FOTO_URL: 7, TEAM_ID: 14, NO_WA_BIZ: 16,
  NAMA_KANTOR: 17,
}

export async function POST(request: Request) {
  const { email, password } = await request.json()
  if (!email || !password)
    return NextResponse.json({ success: false, error: 'Email & password wajib diisi' }, { status: 400 })

  try {
    let agentData: {
      id: string; nama: string; email: string; role: string
      status: string; foto: string; passwordHash: string
    } | null = null

    // ── Coba 1: Google Sheets API langsung (sama persis dgn CRM) ──
    const agentRow = await getAgentRowByEmail(email)
    if (agentRow) {
      agentData = {
        id:           agentRow[COL.ID]           || '',
        nama:         agentRow[COL.NAMA]          || email,
        email:        agentRow[COL.EMAIL]         || email,
        role:         agentRow[COL.ROLE]          || 'agen',
        status:       agentRow[COL.STATUS]        || '',
        foto:         agentRow[COL.FOTO_URL]      || '',
        passwordHash: agentRow[COL.PASSWORD_HASH] || '',
      }
    } else {
      // ── Coba 2: GAS fallback (Password_Hash tidak tersedia, hanya untuk deteksi email) ──
      const url = new URL(GAS_URL)
      url.searchParams.set('action', 'getAgents')
      url.searchParams.set('secret', GAS_SECRET)
      const res    = await fetch(url.toString(), { cache: 'no-store' })
      const json   = await res.json()
      const agents: any[] = json.data || []
      const agent  = agents.find((a: any) =>
        String(a['Email'] || '').toLowerCase() === email.toLowerCase()
      )
      if (agent) {
        agentData = {
          id:           String(agent['ID']     || ''),
          nama:         String(agent['Nama']   || email),
          email:        String(agent['Email']  || email),
          role:         String(agent['Role']   || 'agen'),
          status:       String(agent['Status'] || ''),
          foto:         String(agent['Foto_URL'] || ''),
          passwordHash: '',   // GAS tidak return Password_Hash
        }
      }
    }

    if (!agentData)
      return NextResponse.json({ success: false, error: 'Email tidak ditemukan' }, { status: 401 })

    const statusLower = agentData.status.toLowerCase()
    if (statusLower === 'inactive' || statusLower === 'resigned')
      return NextResponse.json({ success: false, error: 'Akun tidak aktif' }, { status: 403 })

    // ── Verifikasi password ──
    let storedHash = agentData.passwordHash

    // Jika Password_Hash kosong (GAS fallback), cek CONFIG sheet
    if (!storedHash) {
      try {
        const configKey = `pwd_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
        const cu = new URL(GAS_URL)
        cu.searchParams.set('action', 'getConfig')
        cu.searchParams.set('key',    configKey)
        cu.searchParams.set('secret', GAS_SECRET)
        const cr = await fetch(cu.toString(), { cache: 'no-store', signal: AbortSignal.timeout(6000) })
        const cj = await cr.json()
        if (cj.success && cj.value) storedHash = String(cj.value)
      } catch { /* lanjut */ }
    }

    let passwordValid = false
    if (storedHash.startsWith('$2')) {
      passwordValid = await bcrypt.compare(password, storedHash)
    } else if (storedHash) {
      passwordValid = storedHash === password
    }

    if (!passwordValid)
      return NextResponse.json({ success: false, error: 'Password salah' }, { status: 401 })

    const rawRole = agentData.role.toLowerCase().trim()
    let role: AuthUser['role'] = 'agent'
    if (rawRole === 'superadmin' || rawRole === 'principal') role = 'superadmin'
    else if (rawRole === 'admin' || rawRole === 'business_manager') role = 'admin'

    const user: AuthUser = {
      id:      agentData.id,
      name:    agentData.nama,
      email,
      role,
      agentId: agentData.id,
      photo:   agentData.foto,
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
