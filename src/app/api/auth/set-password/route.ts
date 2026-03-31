import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

const GAS_URL    = process.env.NEXT_PUBLIC_GAS_API_URL || ''
const GAS_SECRET = process.env.GAS_API_SECRET || ''

// Endpoint setup password — hanya bisa diakses dengan setup_secret
// Menyimpan bcrypt hash ke CONFIG sheet dengan key: pwd_<email>
export async function POST(request: Request) {
  try {
    const { email, password, setup_secret } = await request.json()

    // Wajib cocok dengan GAS_API_SECRET sebagai ganti auth
    if (!setup_secret || setup_secret !== GAS_SECRET)
      return NextResponse.json({ success: false, error: 'Setup secret salah' }, { status: 403 })

    if (!email || !password)
      return NextResponse.json({ success: false, error: 'email & password wajib diisi' }, { status: 400 })

    if (password.length < 6)
      return NextResponse.json({ success: false, error: 'Password minimal 6 karakter' }, { status: 400 })

    // Generate bcrypt hash (cost 10)
    const hash     = await bcrypt.hash(password, 10)
    const configKey = `pwd_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`

    // Simpan ke CONFIG sheet via GAS saveConfig
    const url = new URL(GAS_URL)
    url.searchParams.set('action', 'saveConfig')
    url.searchParams.set('secret', GAS_SECRET)
    url.searchParams.set('key',    configKey)
    url.searchParams.set('value',  hash)

    const res  = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) })
    const json = await res.json()

    if (!json.success)
      return NextResponse.json({ success: false, error: json.error || 'Gagal simpan ke GSheet' }, { status: 500 })

    return NextResponse.json({ success: true, message: `Password untuk ${email} berhasil diset!` })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
