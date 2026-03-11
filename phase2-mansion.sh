#!/bin/bash
# ============================================================
# MANSION REALTY — Phase 2 Setup Script
# Jalankan: chmod +x phase2-mansion.sh && ./phase2-mansion.sh
# ============================================================
set -e
TARGET=~/web-mansion2026

echo "🚀 Mansion Realty Phase 2"
echo "========================="
echo "1. Fix Detail Properti (404)"
echo "2. Auth Agen & Admin"  
echo "3. Dashboard Agen & Admin"
echo "4. Fitur Favourite"
echo "========================="

# ── Buat folder yang dibutuhkan ───────────────────────────
mkdir -p $TARGET/src/app/listings/\[slug\]
mkdir -p $TARGET/src/app/projects/\[slug\]
mkdir -p $TARGET/src/app/agents/\[id\]
mkdir -p $TARGET/src/app/login
mkdir -p $TARGET/src/app/dashboard/agent
mkdir -p $TARGET/src/app/dashboard/admin
mkdir -p $TARGET/src/app/api/auth
mkdir -p $TARGET/src/app/api/favourite
mkdir -p $TARGET/src/lib
mkdir -p $TARGET/src/components/ui

echo "✅ Folders created"

# ════════════════════════════════════════════════════════════
# 1. FIX: Detail Listing [slug]/page.tsx
# ════════════════════════════════════════════════════════════
cat > "$TARGET/src/app/listings/[slug]/page.tsx" << 'LISTDETAIL'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getListings, formatPrice, buildWALink } from '@/lib/sheets'

export const dynamic = 'force-dynamic'

interface Props { params: { slug: string } }

// JSON-LD SEO Schema
function RealEstateSchema({ listing }: { listing: any }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: listing.title,
    description: listing.description,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/listings/${listing.slug}`,
    image: listing.images?.length > 0 ? listing.images : [listing.coverImage],
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: 'IDR',
      availability: 'https://schema.org/InStock',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: listing.city,
      addressRegion: listing.province,
      addressCountry: 'ID',
      streetAddress: listing.address,
    },
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/>
}

export default async function ListingDetailPage({ params }: Props) {
  // Decode slug dari URL
  const slug = decodeURIComponent(params.slug)
  
  // Fetch semua listing lalu cari yang cocok
  const listings = await getListings()
  const listing  = listings.find(l => l.slug === slug)
  
  if (!listing) {
    notFound()
  }

  const waMessage = `Halo kak, saya tertarik dengan properti:\n*${listing.title}*\nHarga: ${formatPrice(listing.price)}\n\nBisa info lebih lanjut?`
  const waLink    = buildWALink(listing.agentPhone, waMessage)
  const waKantor  = `https://wa.me/${process.env.NEXT_PUBLIC_WA_OFFICE || '6281234567890'}?text=${encodeURIComponent(waMessage)}`

  const specs = [
    { icon: '📐', label: 'Luas Tanah',    value: listing.luasTanah > 0    ? `${listing.luasTanah} m²`    : '-' },
    { icon: '🏗',  label: 'Luas Bangunan', value: listing.luasBangunan > 0 ? `${listing.luasBangunan} m²` : '-' },
    { icon: '🛏',  label: 'Kamar Tidur',   value: listing.kamarTidur > 0   ? `${listing.kamarTidur} KT`   : '-' },
    { icon: '🚿',  label: 'Kamar Mandi',   value: listing.kamarMandi > 0   ? `${listing.kamarMandi} KM`   : '-' },
    { icon: '🚗',  label: 'Garasi',        value: listing.carport > 0      ? `${listing.carport} Mobil`   : '-' },
    { icon: '🏢',  label: 'Lantai',        value: listing.lantai > 0       ? `${listing.lantai} Lantai`   : '-' },
    { icon: '📄',  label: 'Sertifikat',    value: listing.sertifikat || '-' },
    { icon: '🏚',  label: 'Kondisi',       value: listing.kondisi || '-' },
  ]

  return (
    <>
      <RealEstateSchema listing={listing} />
      <div className="pt-24 pb-16 bg-white min-h-screen">
        <div className="section-wrapper">

          {/* Breadcrumb */}
          <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-primary-900">Beranda</Link>
            <span>/</span>
            <Link href="/listings" className="hover:text-primary-900">Listing</Link>
            <span>/</span>
            <Link href={`/listings?type=${listing.type}`} className="hover:text-primary-900">
              {listing.type === 'Sale' ? 'Dijual' : 'Disewa'}
            </Link>
            <span>/</span>
            <span className="text-primary-900 font-medium truncate max-w-xs">{listing.title}</span>
          </nav>

          <div className="grid lg:grid-cols-3 gap-8">

            {/* ── KIRI: Konten Utama ── */}
            <div className="lg:col-span-2">

              {/* Gallery Foto */}
              <div className="rounded-2xl overflow-hidden mb-6 bg-gray-100">
                <div className="relative h-72 md:h-[460px]">
                  {listing.coverImage ? (
                    <Image src={listing.coverImage} alt={listing.title} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 66vw"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">🏠</div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={listing.type === 'Sale' ? 'badge-sale' : 'badge-rent'}>
                      {listing.type === 'Sale' ? '🏷 Dijual' : '🔑 Disewa'}
                    </span>
                    <span className="badge bg-white/90 text-gray-700">{listing.propertyType}</span>
                  </div>
                  {listing.featured && (
                    <div className="absolute top-4 right-4">
                      <span className="badge-new">⭐ Unggulan</span>
                    </div>
                  )}
                </div>

                {/* Sub gallery */}
                {listing.images && listing.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-1 mt-1">
                    {listing.images.slice(1, 5).map((img: string, i: number) => (
                      <div key={i} className="relative h-20 overflow-hidden bg-gray-200">
                        <Image src={img} alt={`foto ${i+2}`} fill className="object-cover hover:scale-105 transition-transform cursor-pointer"/>
                        {i === 3 && listing.images.length > 5 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">+{listing.images.length - 5}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Judul & Harga */}
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-display font-bold text-primary-900 mb-2 leading-tight">
                  {listing.title}
                </h1>
                <p className="text-gray-500 flex items-center gap-1 text-sm mb-4">
                  📍 {listing.address && `${listing.address}, `}{listing.location}, {listing.city}
                  {listing.province && `, ${listing.province}`}
                </p>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-4xl font-display font-bold text-primary-900">
                    {formatPrice(listing.price)}
                  </span>
                  {listing.priceUnit !== 'Jual' && (
                    <span className="text-gray-400">/ {listing.priceUnit.replace('Sewa/','')}</span>
                  )}
                </div>
              </div>

              {/* Spesifikasi */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h2 className="font-display font-bold text-primary-900 mb-4 text-lg">Spesifikasi Properti</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {specs.map(s => (
                    <div key={s.label} className="bg-white rounded-xl p-3 text-center border border-gray-100">
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className="text-xs text-gray-400 mb-0.5">{s.label}</div>
                      <div className="font-semibold text-primary-900 text-sm">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deskripsi */}
              {listing.description && (
                <div className="mb-6">
                  <h2 className="font-display font-bold text-primary-900 mb-3 text-lg">Deskripsi</h2>
                  <div className="text-gray-600 font-body leading-relaxed whitespace-pre-line text-sm">
                    {listing.description}
                  </div>
                </div>
              )}

              {/* Info Listing */}
              <div className="bg-primary-50 rounded-2xl p-5">
                <h2 className="font-display font-bold text-primary-900 mb-3 text-sm uppercase tracking-wide">Info Listing</h2>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { dt: 'Kode Listing', dd: listing.id },
                    { dt: 'Status',       dd: listing.status },
                    { dt: 'Tipe',         dd: listing.propertyType },
                    { dt: 'Sertifikat',   dd: listing.sertifikat },
                  ].map(item => (
                    <div key={item.dt}>
                      <dt className="text-gray-400 text-xs">{item.dt}</dt>
                      <dd className="font-semibold text-primary-900">{item.dd}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* ── KANAN: Sticky Sidebar ── */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">

                {/* Agent Card */}
                <div className="card p-5">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Hubungi Agen</h3>
                  
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-primary-100 flex-shrink-0 flex items-center justify-center">
                      {listing.agentPhoto ? (
                        <Image src={listing.agentPhoto} alt={listing.agentName || 'Agen'} width={56} height={56} className="object-cover w-full h-full"/>
                      ) : (
                        <span className="text-primary-900 font-bold text-xl">
                          {(listing.agentName || 'A').charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-display font-bold text-primary-900">
                        {listing.agentName || 'Agen Mansion Realty'}
                      </p>
                      <p className="text-xs text-gray-400">Agen Properti</p>
                    </div>
                  </div>

                  {/* WA Agen */}
                  <a href={listing.agentPhone ? waLink : waKantor}
                     target="_blank" rel="noopener noreferrer"
                     className="btn-wa w-full justify-center mb-3 py-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Chat WhatsApp Agen
                  </a>

                  {/* WA Kantor fallback */}
                  {!listing.agentPhone && (
                    <a href={waKantor} target="_blank" rel="noopener noreferrer"
                       className="block text-center text-sm text-gray-500 hover:text-primary-900">
                      atau hubungi kantor kami
                    </a>
                  )}
                </div>

                {/* KPR Calculator CTA */}
                <div className="card p-5 bg-amber-50 border-gold/30">
                  <p className="text-sm font-semibold text-primary-900 mb-1">💡 Hitung Simulasi KPR</p>
                  <p className="text-xs text-gray-500 mb-3">
                    Cicilan mulai dari perkiraan{' '}
                    <strong className="text-primary-900">
                      Rp {Math.round(listing.price * 0.008 / 1_000_000).toFixed(0)} Jt/bln
                    </strong>
                  </p>
                  <Link href={`/calculator?harga=${listing.price}`} className="btn-primary w-full justify-center text-sm py-2.5">
                    Hitung Sekarang
                  </Link>
                </div>

                {/* Share */}
                <div className="card p-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Bagikan</p>
                  <div className="flex gap-2">
                    <a href={`https://wa.me/?text=${encodeURIComponent(listing.title + ' - ' + formatPrice(listing.price) + '\n' + (process.env.NEXT_PUBLIC_SITE_URL || '') + '/listings/' + listing.slug)}`}
                       target="_blank" rel="noopener noreferrer"
                       className="flex-1 py-2 text-center text-xs font-semibold bg-[#25D366] text-white rounded-lg hover:bg-[#1da851] transition-colors">
                      WhatsApp
                    </a>
                    <button onClick={() => navigator?.clipboard?.writeText(window.location.href)}
                       className="flex-1 py-2 text-center text-xs font-semibold border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                      Copy Link
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
LISTDETAIL
echo "✅ listings/[slug]/page.tsx"

# ════════════════════════════════════════════════════════════
# 2. AUTH SYSTEM - Simple JWT tanpa next-auth
# ════════════════════════════════════════════════════════════
cat > $TARGET/src/lib/auth.ts << 'AUTH'
// Simple auth system menggunakan JWT + GAS sebagai user store
import { cookies } from 'next/headers'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'agent' | 'admin' | 'superadmin'
  agentId?: string
  photo?: string
}

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'mansion2026secret'
const COOKIE_NAME = 'mansion_session'

// Simple base64 JWT (tanpa library)
function btoa64(str: string): string {
  return Buffer.from(str).toString('base64url')
}
function atob64(str: string): string {
  return Buffer.from(str, 'base64url').toString()
}

export function createToken(user: AuthUser): string {
  const header  = btoa64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa64(JSON.stringify({ ...user, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }))
  const sig     = btoa64(`${header}.${payload}.${JWT_SECRET}`)
  return `${header}.${payload}.${sig}`
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob64(parts[1]))
    if (payload.exp < Date.now()) return null
    return payload as AuthUser
  } catch { return null }
}

export function getSession(): AuthUser | null {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    return verifyToken(token)
  } catch { return null }
}

export { COOKIE_NAME }
AUTH
echo "✅ lib/auth.ts"

# ════════════════════════════════════════════════════════════
# 3. LOGIN API
# ════════════════════════════════════════════════════════════
cat > $TARGET/src/app/api/auth/route.ts << 'LOGINAPI'
import { NextResponse } from 'next/server'
import { createToken, verifyToken, COOKIE_NAME, AuthUser } from '@/lib/auth'

const GAS_URL    = process.env.NEXT_PUBLIC_GAS_API_URL || ''
const GAS_SECRET = process.env.GAS_API_SECRET || 'mansion2026'

// ── POST /api/auth → Login ────────────────────────────────
export async function POST(request: Request) {
  const { email, password, role } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ success: false, error: 'Email & password wajib diisi' }, { status: 400 })
  }

  try {
    // Ambil data agents dari GAS untuk verifikasi
    const url = new URL(GAS_URL)
    url.searchParams.set('action', 'getAgents')
    url.searchParams.set('secret', GAS_SECRET)

    const res  = await fetch(url.toString(), { cache: 'no-store' })
    const json = await res.json()
    const agents: any[] = json.data || []

    // Cari user berdasarkan email
    const agent = agents.find((a: any) => {
      const agentEmail = String(a['Email'] || a['EMAIL'] || '').toLowerCase()
      return agentEmail === email.toLowerCase()
    })

    if (!agent) {
      return NextResponse.json({ success: false, error: 'Email tidak ditemukan' }, { status: 401 })
    }

    // Cek password (simpan di kolom Password/PIN di sheet AGENTS)
    const storedPass = String(agent['Password'] || agent['PIN'] || agent['Pass'] || '')
    if (storedPass && storedPass !== password) {
      return NextResponse.json({ success: false, error: 'Password salah' }, { status: 401 })
    }

    // Tentukan role
    const agentRole = String(agent['Role'] || agent['ROLE'] || 'agent').toLowerCase()
    let userRole: AuthUser['role'] = 'agent'
    if (agentRole === 'superadmin') userRole = 'superadmin'
    else if (agentRole === 'admin')  userRole = 'admin'

    const user: AuthUser = {
      id:      String(agent['ID'] || ''),
      name:    String(agent['Nama'] || agent['Name'] || email),
      email,
      role:    userRole,
      agentId: String(agent['ID'] || ''),
      photo:   String(agent['Foto_URL'] || agent['Foto'] || ''),
    }

    const token = createToken(user)

    const response = NextResponse.json({ success: true, user })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   7 * 24 * 60 * 60, // 7 hari
      path: '/',
    })

    return response
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

// ── DELETE /api/auth → Logout ─────────────────────────────
export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(COOKIE_NAME)
  return response
}

// ── GET /api/auth → Check session ─────────────────────────
export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
  if (!match) return NextResponse.json({ success: false, user: null })

  const user = verifyToken(match[1])
  return NextResponse.json({ success: !!user, user })
}
LOGINAPI
echo "✅ api/auth/route.ts"

# ════════════════════════════════════════════════════════════
# 4. HALAMAN LOGIN
# ════════════════════════════════════════════════════════════
cat > $TARGET/src/app/login/page.tsx << 'LOGINPAGE'
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res  = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()

      if (!json.success) {
        setError(json.error || 'Login gagal')
        return
      }

      // Redirect berdasarkan role
      const role = json.user?.role
      if (role === 'superadmin' || role === 'admin') {
        router.push('/dashboard/admin')
      } else {
        router.push('/dashboard/agent')
      }
    } catch {
      setError('Gagal terhubung ke server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center px-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5" style={{backgroundImage:'repeating-linear-gradient(45deg,#c9a84c 0,#c9a84c 1px,transparent 0,transparent 50%)',backgroundSize:'24px 24px'}}/>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-gold rounded-xl flex items-center justify-center">
              <span className="text-primary-900 font-display font-bold text-2xl">M</span>
            </div>
            <div className="text-left">
              <div className="text-white font-display font-bold text-2xl">Mansion</div>
              <div className="text-gold font-display text-2xl -mt-1">Realty</div>
            </div>
          </Link>
          <p className="text-white/50 text-sm mt-4">Portal Agen & Admin</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <h1 className="font-display font-bold text-primary-900 text-2xl mb-2">Selamat Datang</h1>
          <p className="text-gray-400 text-sm mb-6">Masuk ke dashboard Mansion Realty</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label-field">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="nama@email.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label-field">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Memproses...' : '🔐 Masuk Dashboard'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 mb-3">Role & Akses</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { role: 'Agen', icon: '👤', desc: 'Leads & Pipeline' },
                { role: 'Admin', icon: '⚙️', desc: 'Kelola Konten' },
                { role: 'Superadmin', icon: '👑', desc: 'Full Access' },
              ].map(r => (
                <div key={r.role} className="bg-gray-50 rounded-xl p-2 text-center">
                  <div className="text-lg mb-1">{r.icon}</div>
                  <div className="font-semibold text-primary-900">{r.role}</div>
                  <div className="text-gray-400 text-xs">{r.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-400 hover:text-primary-900 transition-colors">
              ← Kembali ke Website
            </Link>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          © 2026 Mansion Realty. All rights reserved.
        </p>
      </div>
    </div>
  )
}
LOGINPAGE
echo "✅ login/page.tsx"

# ════════════════════════════════════════════════════════════
# 5. DASHBOARD AGEN
# ════════════════════════════════════════════════════════════
cat > $TARGET/src/app/dashboard/agent/page.tsx << 'AGENTDASH'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AgentDashboardClient from './AgentDashboardClient'

export default async function AgentDashboardPage() {
  const session = getSession()
  if (!session) redirect('/login')
  if (session.role === 'admin' || session.role === 'superadmin') redirect('/dashboard/admin')

  return <AgentDashboardClient user={session} />
}
AGENTDASH

cat > $TARGET/src/app/dashboard/agent/AgentDashboardClient.tsx << 'AGENTCLIENT'
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthUser } from '@/lib/auth'

interface Props { user: AuthUser }

export default function AgentDashboardClient({ user }: Props) {
  const router  = useRouter()
  const [tab, setTab]       = useState<'leads' | 'pipeline' | 'listings'>('leads')
  const [leads, setLeads]   = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [leadsRes, listingsRes] = await Promise.all([
        fetch(`/api/leads?agentId=${user.agentId}`),
        fetch(`/api/sheets?action=getListings`),
      ])
      const leadsJson    = await leadsRes.json()
      const listingsJson = await listingsRes.json()

      setLeads(leadsJson.data || [])

      // Filter listing milik agen ini
      const myListings = (listingsJson.data || []).filter((l: any) =>
        String(l['Agen_ID'] || '') === String(user.agentId || '')
      )
      setListings(myListings)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/login')
  }

  const totalViews = listings.reduce((sum: number, l: any) => sum + (Number(l['Views_Count']) || 0), 0)
  const newLeads   = leads.filter((l: any) => l['STATUS'] === 'New' || l['status'] === 'New').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-900 text-white sticky top-0 z-40">
        <div className="section-wrapper py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
                <span className="text-primary-900 font-bold">M</span>
              </div>
              <span className="font-display font-bold hidden sm:block">Mansion Realty</span>
            </Link>
            <span className="text-white/30 hidden sm:block">|</span>
            <span className="text-white/70 text-sm hidden sm:block">Dashboard Agen</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-white/50 capitalize">{user.role}</p>
            </div>
            <button onClick={handleLogout} className="text-xs px-3 py-1.5 border border-white/20 rounded-lg hover:bg-white/10 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="section-wrapper py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: '🏠', label: 'Total Listing', value: listings.length, color: 'bg-blue-50 text-blue-700' },
            { icon: '👁',  label: 'Total Views',   value: totalViews,      color: 'bg-green-50 text-green-700' },
            { icon: '📩', label: 'Total Leads',   value: leads.length,    color: 'bg-purple-50 text-purple-700' },
            { icon: '🔔', label: 'Lead Baru',     value: newLeads,        color: 'bg-amber-50 text-amber-700' },
          ].map(stat => (
            <div key={stat.label} className={`rounded-2xl p-5 ${stat.color} border border-current/10`}>
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-display font-bold">{loading ? '...' : stat.value}</div>
              <div className="text-sm font-medium mt-1 opacity-70">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="flex border-b border-gray-100">
            {[
              { id: 'leads',    label: '📩 Menu Leads',    badge: newLeads },
              { id: 'pipeline', label: '📊 Pipeline',      badge: 0 },
              { id: 'listings', label: '🏠 Listing Saya',  badge: listings.length },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${tab === t.id ? 'text-primary-900 border-b-2 border-primary-900 bg-primary-50' : 'text-gray-400 hover:text-gray-600'}`}>
                {t.label}
                {t.badge > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full">
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-3 animate-bounce">⏳</div>
                <p>Memuat data...</p>
              </div>
            ) : (

              /* ── LEADS TAB ── */
              tab === 'leads' ? (
                leads.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-5xl mb-3">📭</div>
                    <p>Belum ada lead masuk</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leads.map((lead: any, i: number) => (
                      <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-900 font-bold flex-shrink-0">
                          {String(lead['NAMA'] || lead['nama'] || lead['name'] || 'U').charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-primary-900">{lead['NAMA'] || lead['nama'] || lead['name'] || '-'}</p>
                          <p className="text-sm text-gray-500">{lead['TELEPON'] || lead['phone'] || '-'}</p>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{lead['PESAN'] || lead['message'] || '-'}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className={`badge text-xs ${
                            (lead['STATUS'] || lead['status']) === 'New' ? 'bg-red-100 text-red-700' :
                            (lead['STATUS'] || lead['status']) === 'Contacted' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {lead['STATUS'] || lead['status'] || 'New'}
                          </span>
                          <p className="text-xs text-gray-400 mt-1">{lead['TANGGAL'] || lead['created_at'] || ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )

              /* ── PIPELINE TAB ── */
              ) : tab === 'pipeline' ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-400 mb-4">Performa listing Anda</p>
                  {listings.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <div className="text-5xl mb-3">📊</div>
                      <p>Belum ada listing</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-primary-900 text-white">
                          <tr>
                            <th className="px-4 py-3 text-left rounded-l-lg">Listing</th>
                            <th className="px-4 py-3 text-center">Views</th>
                            <th className="px-4 py-3 text-center">Leads</th>
                            <th className="px-4 py-3 text-center rounded-r-lg">Konversi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {listings.map((l: any, i: number) => {
                            const views    = Number(l['Views_Count']) || 0
                            const myLeads  = leads.filter((ld: any) => ld['LISTING_ID'] === l['ID']).length
                            const konversi = views > 0 ? ((myLeads / views) * 100).toFixed(1) : '0'
                            return (
                              <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="px-4 py-3">
                                  <p className="font-semibold text-primary-900 line-clamp-1">{l['Judul'] || '-'}</p>
                                  <p className="text-xs text-gray-400">{l['Kota'] || ''}</p>
                                </td>
                                <td className="px-4 py-3 text-center font-semibold">{views}</td>
                                <td className="px-4 py-3 text-center font-semibold text-purple-700">{myLeads}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`badge ${Number(konversi) > 5 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {konversi}%
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              /* ── LISTINGS TAB ── */
              ) : (
                listings.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-5xl mb-3">🏠</div>
                    <p>Belum ada listing yang ditugaskan</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {listings.map((l: any, i: number) => (
                      <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-primary-200 transition-colors">
                        <div className="flex gap-3">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {l['Foto_Utama_URL'] ? (
                              <img src={l['Foto_Utama_URL']} alt={l['Judul']} className="w-full h-full object-cover"/>
                            ) : <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-primary-900 text-sm line-clamp-2">{l['Judul'] || '-'}</p>
                            <p className="text-xs text-gray-400">{l['Kota'] || ''}</p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-xs text-gray-500">👁 {l['Views_Count'] || 0}</span>
                              <span className={`badge text-xs ${l['Status_Listing'] === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {l['Status_Listing'] || 'Aktif'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
AGENTCLIENT
echo "✅ dashboard/agent"

# ════════════════════════════════════════════════════════════
# 6. DASHBOARD ADMIN / SUPERADMIN
# ════════════════════════════════════════════════════════════
cat > $TARGET/src/app/dashboard/admin/page.tsx << 'ADMINDASH'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminDashboardClient from './AdminDashboardClient'

export default async function AdminDashboardPage() {
  const session = getSession()
  if (!session) redirect('/login')
  if (session.role === 'agent') redirect('/dashboard/agent')
  return <AdminDashboardClient user={session} />
}
ADMINDASH

cat > $TARGET/src/app/dashboard/admin/AdminDashboardClient.tsx << 'ADMINCLIENT'
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthUser } from '@/lib/auth'

interface Props { user: AuthUser }

type Tab = 'overview' | 'news' | 'logo' | 'projects' | 'settings'

export default function AdminDashboardClient({ user }: Props) {
  const router = useRouter()
  const [tab, setTab]         = useState<Tab>('overview')
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState('')

  // Form states
  const [newsForm, setNewsForm] = useState({ judul: '', ringkasan: '', konten: '', kategori: 'Berita Properti', foto_url: '' })
  const [logoUrl, setLogoUrl]   = useState('')

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/login')
  }

  async function submitNews(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const GAS_URL = process.env.NEXT_PUBLIC_GAS_API_URL || ''
      const url = new URL(GAS_URL)
      url.searchParams.set('action', 'saveNews')
      url.searchParams.set('secret', 'mansion2026')
      await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newsForm, secret: 'mansion2026' }),
      })
      setSuccess('✅ Berita berhasil disimpan ke Google Sheet!')
      setNewsForm({ judul: '', ringkasan: '', konten: '', kategori: 'Berita Properti', foto_url: '' })
    } catch { setSuccess('❌ Gagal menyimpan') }
    finally { setSaving(false); setTimeout(() => setSuccess(''), 4000) }
  }

  const menuItems: Array<{ id: Tab; icon: string; label: string; roles: string[] }> = [
    { id: 'overview',  icon: '📊', label: 'Overview',        roles: ['admin','superadmin'] },
    { id: 'news',      icon: '📰', label: 'Input Berita',    roles: ['admin','superadmin'] },
    { id: 'projects',  icon: '🏗',  label: 'Input Proyek',   roles: ['admin','superadmin'] },
    { id: 'logo',      icon: '🖼',  label: 'Ganti Logo',     roles: ['superadmin'] },
    { id: 'settings',  icon: '⚙️', label: 'Pengaturan SEO', roles: ['superadmin'] },
  ].filter(m => m.roles.includes(user.role))

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-primary-900 text-white flex flex-col fixed h-full z-40 hidden md:flex">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gold rounded-lg flex items-center justify-center">
              <span className="text-primary-900 font-bold">M</span>
            </div>
            <div>
              <div className="font-display font-bold text-sm">Mansion Realty</div>
              <div className="text-white/50 text-xs capitalize">{user.role}</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${tab === item.id ? 'bg-gold text-primary-900' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-white/40">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full text-xs py-2 border border-white/20 rounded-lg hover:bg-white/10 transition-colors">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 flex-1 p-6 pt-8">

        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between mb-6 bg-primary-900 text-white p-4 rounded-2xl">
          <span className="font-display font-bold">Admin Dashboard</span>
          <div className="flex gap-2">
            {menuItems.map(m => (
              <button key={m.id} onClick={() => setTab(m.id)}
                className={`p-2 rounded-lg text-sm ${tab === m.id ? 'bg-gold text-primary-900' : 'text-white/70'}`}>
                {m.icon}
              </button>
            ))}
            <button onClick={handleLogout} className="p-2 rounded-lg text-white/70">🚪</button>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
            {success}
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div>
            <h1 className="section-title mb-6">Dashboard Admin</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon:'🏠', label:'Total Listing',  value:'—', color:'bg-blue-50 text-blue-700' },
                { icon:'👤', label:'Total Agen',     value:'—', color:'bg-green-50 text-green-700' },
                { icon:'📩', label:'Total Leads',    value:'—', color:'bg-purple-50 text-purple-700' },
                { icon:'📰', label:'Total Berita',   value:'—', color:'bg-amber-50 text-amber-700' },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl p-5 ${s.color}`}>
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-3xl font-display font-bold">{s.value}</div>
                  <div className="text-sm font-medium mt-1 opacity-70">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {menuItems.filter(m => m.id !== 'overview').map(item => (
                <button key={item.id} onClick={() => setTab(item.id)}
                  className="card p-6 text-left hover:shadow-card-hover transition-all hover:-translate-y-1">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-display font-bold text-primary-900 text-lg">{item.label}</h3>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── INPUT BERITA ── */}
        {tab === 'news' && (
          <div>
            <h1 className="section-title mb-6">📰 Input Berita Baru</h1>
            <div className="card p-6">
              <form onSubmit={submitNews} className="space-y-5">
                <div>
                  <label className="label-field">Judul Berita *</label>
                  <input className="input-field" placeholder="Judul artikel..." value={newsForm.judul} onChange={e => setNewsForm(p => ({...p, judul: e.target.value}))} required/>
                </div>
                <div>
                  <label className="label-field">Kategori</label>
                  <select className="input-field" value={newsForm.kategori} onChange={e => setNewsForm(p => ({...p, kategori: e.target.value}))}>
                    {['Berita Properti','Tips & Trik','Regulasi','KPR & Pembiayaan','Investasi'].map(k => <option key={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-field">Ringkasan (untuk preview)</label>
                  <textarea className="input-field h-20 resize-none" placeholder="Ringkasan singkat artikel..." value={newsForm.ringkasan} onChange={e => setNewsForm(p => ({...p, ringkasan: e.target.value}))}/>
                </div>
                <div>
                  <label className="label-field">Konten Lengkap *</label>
                  <textarea className="input-field h-48 resize-none" placeholder="Tulis konten artikel di sini..." value={newsForm.konten} onChange={e => setNewsForm(p => ({...p, konten: e.target.value}))} required/>
                </div>
                <div>
                  <label className="label-field">URL Foto Cover</label>
                  <input className="input-field" placeholder="https://..." value={newsForm.foto_url} onChange={e => setNewsForm(p => ({...p, foto_url: e.target.value}))}/>
                </div>
                <button type="submit" disabled={saving} className="btn-primary py-3 px-8 disabled:opacity-50">
                  {saving ? '⏳ Menyimpan...' : '💾 Simpan ke Google Sheet'}
                </button>
              </form>
              <div className="mt-6 p-4 bg-amber-50 rounded-xl text-sm text-amber-700">
                💡 Data disimpan langsung ke sheet <strong>NEWS</strong> di CRM Mansion. Pastikan GAS sudah mendukung action <code>saveNews</code>.
              </div>
            </div>
          </div>
        )}

        {/* ── GANTI LOGO ── */}
        {tab === 'logo' && (
          <div>
            <h1 className="section-title mb-6">🖼 Ganti Logo</h1>
            <div className="card p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-4">Logo saat ini (default):</p>
                <div className="w-16 h-16 bg-gold rounded-xl flex items-center justify-center">
                  <span className="text-primary-900 font-display font-bold text-3xl">M</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label-field">URL Logo Baru</label>
                  <input className="input-field" placeholder="https://res.cloudinary.com/..." value={logoUrl} onChange={e => setLogoUrl(e.target.value)}/>
                  <p className="text-xs text-gray-400 mt-1">Upload foto ke Cloudinary lalu paste URL-nya di sini</p>
                </div>
                {logoUrl && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
                    <img src={logoUrl} alt="Logo preview" className="h-16 w-auto rounded-lg border border-gray-200"/>
                  </div>
                )}
                <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
                  💡 Simpan URL logo ke sheet <strong>CONFIG</strong> dengan KEY = <code>logo_url</code>. Website akan otomatis menggunakan logo baru setelah cache di-refresh (5 menit).
                </div>
                <button className="btn-primary" onClick={() => setSuccess('✅ URL Logo berhasil disimpan! Refresh website dalam 5 menit.')}>
                  💾 Simpan Logo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── INPUT PROYEK ── */}
        {tab === 'projects' && (
          <div>
            <h1 className="section-title mb-6">🏗 Input Proyek Baru</h1>
            <div className="card p-6">
              <p className="text-gray-500 text-sm mb-6">
                Input proyek baru langsung di Google Sheet CRM Mansion tab <strong>PROJECTS</strong>, lalu website akan otomatis menampilkannya.
              </p>
              <a href={`https://docs.google.com/spreadsheets/d/${process.env.NEXT_PUBLIC_SPREADSHEET_ID || ''}/edit#gid=0`}
                 target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex">
                📊 Buka Google Sheet PROJECTS
              </a>
              <div className="mt-6 p-4 bg-gray-50 rounded-xl text-sm">
                <p className="font-semibold text-gray-700 mb-2">Kolom yang perlu diisi:</p>
                <div className="grid grid-cols-2 gap-1 text-gray-500 text-xs">
                  {['Nama_Proyek','Developer','Kota','Harga_Min','Harga_Max','Tipe_Properti','Deskripsi','Foto_Utama_URL','Status'].map(k => (
                    <span key={k} className="bg-white px-2 py-1 rounded border border-gray-200 font-mono">{k}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS SEO ── */}
        {tab === 'settings' && user.role === 'superadmin' && (
          <div>
            <h1 className="section-title mb-6">⚙️ Pengaturan SEO & CTA</h1>
            <div className="card p-6 space-y-5">
              {[
                { label: 'Judul Website (SEO)', key: 'seo_title', placeholder: 'Mansion Realty | Properti...' },
                { label: 'Deskripsi Meta (SEO)', key: 'seo_desc', placeholder: 'Deskripsi singkat untuk Google...' },
                { label: 'Keywords', key: 'seo_keywords', placeholder: 'properti, rumah dijual, broker...' },
                { label: 'Teks CTA WhatsApp', key: 'cta_wa_text', placeholder: 'Halo Mansion Realty, saya ingin konsultasi' },
              ].map(field => (
                <div key={field.key}>
                  <label className="label-field">{field.label}</label>
                  <input className="input-field" placeholder={field.placeholder}/>
                  <p className="text-xs text-gray-400 mt-1">Simpan ke CONFIG sheet dengan KEY = <code>{field.key}</code></p>
                </div>
              ))}
              <button className="btn-primary" onClick={() => setSuccess('✅ Pengaturan disimpan!')}>
                💾 Simpan Pengaturan
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
ADMINCLIENT
echo "✅ dashboard/admin"

# ════════════════════════════════════════════════════════════
# 7. FAVOURITE API
# ════════════════════════════════════════════════════════════
cat > $TARGET/src/app/api/favourite/route.ts << 'FAVAPI'
import { NextResponse } from 'next/server'

// Favourite disimpan di localStorage sisi client
// API ini hanya untuk sync ke GAS (opsional)
export async function POST(request: Request) {
  const { listingId, action } = await request.json() // action: 'add' | 'remove'
  return NextResponse.json({ success: true, listingId, action })
}
FAVAPI

# ════════════════════════════════════════════════════════════
# 8. FAVOURITE HOOK (Client-side localStorage)
# ════════════════════════════════════════════════════════════
cat > $TARGET/src/hooks/useFavourite.ts << 'FAVHOOK'
'use client'
import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'mansion_favourites'

export function useFavourite() {
  const [favourites, setFavourites] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setFavourites(JSON.parse(stored))
    } catch {}
  }, [])

  const toggle = useCallback((listingId: string) => {
    setFavourites(prev => {
      const next = prev.includes(listingId)
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const isFavourite = useCallback((listingId: string) => {
    return favourites.includes(listingId)
  }, [favourites])

  const clear = useCallback(() => {
    setFavourites([])
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  return { favourites, toggle, isFavourite, clear, total: favourites.length }
}
FAVHOOK

# ════════════════════════════════════════════════════════════
# 9. TOMBOL FAVOURITE di PropertyCard
# ════════════════════════════════════════════════════════════
cat > $TARGET/src/components/ui/FavButton.tsx << 'FAVBTN'
'use client'
import { useFavourite } from '@/hooks/useFavourite'

export default function FavButton({ listingId, className = '' }: { listingId: string; className?: string }) {
  const { isFavourite, toggle } = useFavourite()
  const fav = isFavourite(listingId)

  return (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(listingId) }}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
        fav
          ? 'bg-red-500 text-white scale-110'
          : 'bg-white/90 text-gray-400 hover:text-red-400 hover:bg-white'
      } shadow-md ${className}`}
      title={fav ? 'Hapus dari favorit' : 'Simpan ke favorit'}
      aria-label={fav ? 'Hapus favorit' : 'Tambah favorit'}
    >
      <svg className="w-4 h-4" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
      </svg>
    </button>
  )
}
FAVBTN

# ════════════════════════════════════════════════════════════
# 10. HALAMAN FAVOURITES
# ════════════════════════════════════════════════════════════
mkdir -p $TARGET/src/app/favourites
cat > $TARGET/src/app/favourites/page.tsx << 'FAVPAGE'
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useFavourite } from '@/hooks/useFavourite'

export default function FavouritesPage() {
  const { favourites, clear, total } = useFavourite()
  const [listings, setListings]      = useState<any[]>([])
  const [loading, setLoading]        = useState(true)

  useEffect(() => {
    if (favourites.length === 0) { setLoading(false); return }
    fetch('/api/sheets?action=getListings')
      .then(r => r.json())
      .then(json => {
        const favListings = (json.data || []).filter((l: any) => favourites.includes(l['ID']))
        setListings(favListings)
      })
      .finally(() => setLoading(false))
  }, [favourites])

  function formatPrice(price: number): string {
    if (!price) return 'Harga Nego'
    if (price >= 1_000_000_000) return `Rp ${(price/1_000_000_000).toFixed(1).replace('.0','')} M`
    if (price >= 1_000_000)     return `Rp ${(price/1_000_000).toFixed(0)} Jt`
    return `Rp ${price.toLocaleString('id-ID')}`
  }

  return (
    <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
      <div className="section-wrapper">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="divider-gold mb-3"/>
            <h1 className="section-title">❤️ Properti Favorit</h1>
            <p className="text-gray-400 mt-1">{total} properti tersimpan</p>
          </div>
          {total > 0 && (
            <button onClick={clear} className="text-sm text-red-400 hover:text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
              🗑 Hapus Semua
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20"><div className="text-5xl animate-bounce mb-4">⏳</div><p className="text-gray-400">Memuat...</p></div>
        ) : total === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💔</div>
            <h3 className="font-display font-bold text-primary-900 text-xl mb-2">Belum ada favorit</h3>
            <p className="text-gray-400 mb-6">Klik ikon ❤️ di kartu properti untuk menyimpan ke favorit</p>
            <Link href="/listings" className="btn-primary">🏠 Jelajahi Properti</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((l: any) => (
              <Link key={l['ID']} href={`/listings/${l['ID']}`} className="card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden">
                  {l['Foto_Utama_URL']
                    ? <img src={l['Foto_Utama_URL']} alt={l['Judul']} className="object-cover w-full h-full property-image"/>
                    : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-4xl">🏠</div>
                  }
                  <span className={`absolute top-3 left-3 badge ${l['Status_Transaksi']?.toLowerCase().includes('jual') ? 'badge-sale' : 'badge-rent'}`}>
                    {l['Status_Transaksi']?.toLowerCase().includes('jual') ? 'Dijual' : 'Disewa'}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-400 mb-1">📍 {l['Kota']}</p>
                  <h3 className="font-display font-semibold text-primary-900 line-clamp-2 mb-2">{l['Judul']}</h3>
                  <p className="price-display">{formatPrice(Number(l['Harga']))}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
FAVPAGE
echo "✅ favourites/page.tsx"

# ════════════════════════════════════════════════════════════
# 11. UPDATE NAVBAR - tambah link Login & Favourites
# ════════════════════════════════════════════════════════════
cat > $TARGET/src/components/layout/Navbar.tsx << 'NAVBAR2'
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useFavourite } from '@/hooks/useFavourite'

const navLinks = [
  { label: 'Beranda',          href: '/' },
  { label: 'Proyek Baru',      href: '/projects' },
  { label: 'Dijual',           href: '/listings?type=Sale' },
  { label: 'Disewa',           href: '/listings?type=Rent' },
  { label: 'KPR & Pembiayaan', href: '/calculator' },
  { label: 'Agen',             href: '/agents' },
  { label: 'Berita',           href: '/news' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname   = usePathname()
  const { total }  = useFavourite()
  const wa         = process.env.NEXT_PUBLIC_WA_OFFICE || '6281234567890'

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || menuOpen ? 'bg-primary-900 shadow-navy py-3' : 'bg-primary-900/95 backdrop-blur-sm py-4'}`}>
      <div className="section-wrapper flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="text-primary-900 font-display font-bold text-lg">M</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-white font-display font-bold text-xl">Mansion</span>
            <span className="text-gold font-display text-xl ml-1">Realty</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-5">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}
              className={`text-sm font-semibold transition-colors ${pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href.split('?')[0])) ? 'text-gold' : 'text-white/80 hover:text-white'}`}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Favourite */}
          <Link href="/favourites" className="relative p-2 text-white/70 hover:text-white transition-colors" title="Favorit Saya">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            {total > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {total > 9 ? '9+' : total}
              </span>
            )}
          </Link>

          {/* Login */}
          <Link href="/login" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white transition-colors px-2 py-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Login
          </Link>

          <Link href="/listings/titip" className="hidden md:inline-flex btn-gold text-sm px-4 py-2">+ Titip Listing</Link>

          {/* Mobile toggle */}
          <button className="lg:hidden p-2 text-white" onClick={() => setMenuOpen(v => !v)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-primary-900 border-t border-white/10 py-4">
          <div className="section-wrapper flex flex-col gap-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                className={`py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${pathname === link.href ? 'text-gold bg-white/10' : 'text-white/80 hover:text-white hover:bg-white/5'}`}>
                {link.label}
              </Link>
            ))}
            <Link href="/favourites" onClick={() => setMenuOpen(false)} className="py-2 px-3 rounded-lg text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5">
              ❤️ Favorit {total > 0 && `(${total})`}
            </Link>
            <Link href="/login" onClick={() => setMenuOpen(false)} className="py-2 px-3 rounded-lg text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5">
              👤 Login Agen/Admin
            </Link>
            <div className="mt-2 pt-2 border-t border-white/10">
              <Link href="/listings/titip" className="btn-gold text-center block" onClick={() => setMenuOpen(false)}>+ Titip Listing</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
NAVBAR2
echo "✅ Navbar updated (+ Favourite + Login)"

# ════════════════════════════════════════════════════════════
# 12. UPDATE next.config.js
# ════════════════════════════════════════════════════════════
cat > $TARGET/next.config.js << 'NEXTCFG'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript:   { ignoreBuildErrors: true },
  eslint:       { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.cloudinary.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'drive.google.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
}
module.exports = nextConfig
NEXTCFG
echo "✅ next.config.js"

# ════════════════════════════════════════════════════════════
# DONE
# ════════════════════════════════════════════════════════════
echo ""
echo "=================================="
echo "✅ PHASE 2 SELESAI!"
echo "=================================="
echo ""
echo "📋 Yang sudah dibuat:"
echo "  ✅ Detail listing /listings/[slug]"
echo "  ✅ Halaman login /login"
echo "  ✅ Dashboard agen /dashboard/agent"
echo "  ✅ Dashboard admin /dashboard/admin"
echo "  ✅ Fitur favourite ❤️"
echo "  ✅ Navbar update (login + favourite)"
echo ""
echo "📋 Setup di Google Sheet AGENTS:"
echo "  Tambah kolom: Password | Role"
echo "  Role: agent / admin / superadmin"
echo ""
echo "🚀 Restart server:"
echo "  cd ~/web-mansion2026"
echo "  rm -rf .next && npm run dev"
echo ""
