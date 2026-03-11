#!/bin/bash
# ============================================================
# MANSION REALTY — Auto Setup Script
# Jalankan di Google Cloud Shell:
# chmod +x setup-mansion.sh && ./setup-mansion.sh
# ============================================================
set -e

TARGET=~/web-mansion2026
echo "🏛  Mansion Realty — Auto Setup"
echo "📁 Target: $TARGET"
echo "================================"

# ── Buat struktur folder ──────────────────────────────────
mkdir -p $TARGET/src/app/listings/titip
mkdir -p $TARGET/src/app/listings/\[slug\]
mkdir -p $TARGET/src/app/projects/\[slug\]
mkdir -p $TARGET/src/app/calculator
mkdir -p $TARGET/src/app/agents/\[id\]
mkdir -p $TARGET/src/app/news/\[slug\]
mkdir -p $TARGET/src/app/admin
mkdir -p $TARGET/src/app/api/sheets
mkdir -p $TARGET/src/app/api/leads
mkdir -p $TARGET/src/components/layout
mkdir -p $TARGET/src/components/property
mkdir -p $TARGET/src/components/calculator
mkdir -p $TARGET/src/components/agent
mkdir -p $TARGET/src/components/ui
mkdir -p $TARGET/src/lib
mkdir -p $TARGET/src/hooks
mkdir -p $TARGET/src/types
mkdir -p $TARGET/public/images/banks
mkdir -p $TARGET/gas

echo "✅ Folder structure created"

# ── package.json ──────────────────────────────────────────
cat > $TARGET/package.json << 'PKGJSON'
{
  "name": "mansion-realty",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p ${PORT:-3000}",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "googleapis": "^140.0.1",
    "google-auth-library": "^9.11.0",
    "next-auth": "^4.24.7",
    "jose": "^5.6.3",
    "axios": "^1.7.2",
    "date-fns": "^3.6.0",
    "sharp": "^0.33.4"
  },
  "devDependencies": {
    "@types/node": "^20.14.10",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.5",
    "postcss": "^8.4.39",
    "tailwindcss": "^3.4.6",
    "typescript": "^5.5.3"
  }
}
PKGJSON
echo "✅ package.json"

# ── tailwind.config.js ────────────────────────────────────
cat > $TARGET/tailwind.config.js << 'TWCONFIG'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0a2342',
          50:  '#e8eef5',
          100: '#c5d3e8',
          200: '#9fb6d9',
          300: '#7899ca',
          400: '#5a83be',
          500: '#3c6db3',
          600: '#2a5a9f',
          700: '#1a4585',
          800: '#0f3068',
          900: '#0a2342',
          950: '#061629',
        },
        gold: {
          DEFAULT: '#c9a84c',
          light: '#e8c96a',
          dark:  '#a07c2e',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body:    ['var(--font-dm-sans)',  'system-ui', 'sans-serif'],
        mono:    ['var(--font-jetbrains)', 'monospace'],
      },
      animation: {
        'fade-in-up':    'fadeInUp 0.6s ease-out forwards',
        'fade-in':       'fadeIn 0.4s ease-out forwards',
        'pulse-gold':    'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201,168,76,0.4)' },
          '50%':      { boxShadow: '0 0 0 10px rgba(201,168,76,0)' },
        },
      },
      boxShadow: {
        'card':       '0 4px 24px rgba(10,35,66,0.08)',
        'card-hover': '0 12px 48px rgba(10,35,66,0.18)',
        'gold':       '0 4px 20px rgba(201,168,76,0.3)',
        'navy':       '0 8px 32px rgba(10,35,66,0.25)',
      },
    },
  },
  plugins: [],
}
TWCONFIG
echo "✅ tailwind.config.js"

# ── postcss.config.js ─────────────────────────────────────
cat > $TARGET/postcss.config.js << 'POSTCSS'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
POSTCSS

# ── next.config.js ────────────────────────────────────────
cat > $TARGET/next.config.js << 'NEXTCFG'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'docs.google.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
}
module.exports = nextConfig
NEXTCFG
echo "✅ next.config.js"

# ── tsconfig.json ─────────────────────────────────────────
cat > $TARGET/tsconfig.json << 'TSCONFIG'
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
TSCONFIG

# ── .env.example ─────────────────────────────────────────
cat > $TARGET/.env.example << 'ENVEX'
# Salin file ini ke .env.local lalu isi nilainya
NEXT_PUBLIC_GAS_API_URL=https://script.google.com/macros/s/GANTI_ID_DEPLOYMENT_GAS/exec
GAS_API_SECRET=ganti_secret_rahasia_anda

SPREADSHEET_ID=ganti_id_google_sheet_crm_mansion

NEXTAUTH_SECRET=ganti_dengan_random_string_panjang
NEXTAUTH_URL=http://localhost:3000

NEXT_PUBLIC_WA_OFFICE=628123456789
NEXT_PUBLIC_COMPANY_NAME=Mansion Realty
NEXT_PUBLIC_COMPANY_TAGLINE=Properti Impian Anda, Investasi Terbaik Anda
NEXT_PUBLIC_COMPANY_ADDRESS=Jl. Properti Raya No. 1, Jakarta Selatan
NEXT_PUBLIC_COMPANY_EMAIL=info@mansionrealty.co.id
NEXT_PUBLIC_COMPANY_PHONE=+6221-1234-5678
NEXT_PUBLIC_SITE_URL=https://mansionrealty.co.id
ENVEX

# Buat .env.local awal
cp $TARGET/.env.example $TARGET/.env.local
echo "✅ .env files"

# ── .gitignore ────────────────────────────────────────────
cat > $TARGET/.gitignore << 'GITIGNORE'
node_modules/
.next/
out/
.env
.env.local
.env.*.local
*.pem
.DS_Store
npm-debug.log*
next-env.d.ts
*.tsbuildinfo
service-account*.json
GITIGNORE

# ── src/types/index.ts ────────────────────────────────────
cat > $TARGET/src/types/index.ts << 'TYPES'
export interface Project {
  id: string; slug: string; name: string; developer: string
  location: string; city: string; province: string
  priceMin: number; priceMax: number
  type: 'Perumahan' | 'Apartemen' | 'Ruko' | 'Kavling' | 'Komersial'
  status: 'Aktif' | 'Sold Out' | 'Coming Soon'
  description: string; coverImage: string; images: string[]
  specs: { luasTanah?: string; luasBangunan?: string; kamarTidur?: number; kamarMandi?: number; carport?: number; listrikDaya?: string; airBersih?: string }
  facilities: string[]; agentId?: string; createdAt: string; updatedAt: string
}

export interface Listing {
  id: string; slug: string; title: string
  type: 'Sale' | 'Rent'
  propertyType: 'Rumah' | 'Apartemen' | 'Ruko' | 'Kavling' | 'Gedung' | 'Gudang'
  price: number; priceUnit: 'Jual' | 'Sewa/Bulan' | 'Sewa/Tahun'
  location: string; address: string; city: string; province: string
  luasTanah: number; luasBangunan: number; kamarTidur: number
  kamarMandi: number; carport: number; lantai: number
  kondisi: 'Baru' | 'Bagus' | 'Perlu Renovasi'
  sertifikat: 'SHM' | 'HGB' | 'AJB' | 'SHRS' | 'Lainnya'
  description: string; coverImage: string; images: string[]
  agentId: string; agentName: string; agentPhone: string; agentPhoto: string
  viewCount: number; leadCount: number
  status: 'Aktif' | 'Terjual' | 'Disewa' | 'Off Market'
  featured: boolean; createdAt: string; updatedAt: string
}

export interface Agent {
  id: string; name: string; photo: string; phone: string
  email: string; whatsapp: string; bio: string
  specialization: string[]; areas: string[]
  totalListings: number; totalDeals: number; rating: number
  verified: boolean; joinDate: string; instagram?: string; linkedin?: string
}

export interface News {
  id: string; slug: string; title: string; summary: string
  content: string; coverImage: string
  category: 'Berita Properti' | 'Tips & Trik' | 'Regulasi' | 'KPR & Pembiayaan' | 'Investasi'
  author: string; publishedAt: string; tags: string[]; viewCount: number
}

export interface Lead {
  id?: string; listingId: string; listingTitle: string; agentId: string
  name: string; phone: string; email?: string; message: string
  source: 'WhatsApp' | 'Form' | 'Call'
  createdAt?: string; status?: 'New' | 'Contacted' | 'Qualified' | 'Closed'
}

export interface KPRParams {
  hargaProperti: number; uangMuka: number; tenor: number
  bungaTahunan: number; jenis: 'konvensional' | 'syariah' | 'kmg' | 'takeover'
}

export interface KPRResult {
  pokokPinjaman: number; angsuranPokok: number; angsuranBunga: number
  totalAngsuran: number; totalPembayaran: number; totalBunga: number
  breakdown: Array<{ bulan: number; angsuran: number; pokok: number; bunga: number; sisaPokok: number }>
}

export interface SheetRow { [key: string]: string | number | boolean | null }

export interface APIResponse<T> {
  success: boolean; data?: T; error?: string; timestamp: string; cached?: boolean
}
TYPES
echo "✅ types/index.ts"

# ── src/lib/sheets.ts ─────────────────────────────────────
cat > $TARGET/src/lib/sheets.ts << 'SHEETSLIB'
import { Project, Listing, Agent, News, SheetRow } from '@/types'

const GAS_URL    = process.env.NEXT_PUBLIC_GAS_API_URL!
const GAS_SECRET = process.env.GAS_API_SECRET || ''

// In-Memory Cache
interface CacheEntry<T> { data: T; expiresAt: number }
const cache = new Map<string, CacheEntry<unknown>>()

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry || Date.now() > entry.expiresAt) { cache.delete(key); return null }
  return entry.data as T
}
function setCached<T>(key: string, data: T, ttl = 300) {
  cache.set(key, { data, expiresAt: Date.now() + ttl * 1000 })
}

async function fetchFromGAS<T>(action: string, params: Record<string, string> = {}, ttl = 300): Promise<T> {
  const cacheKey = `gas:${action}:${JSON.stringify(params)}`
  const cached = getCached<T>(cacheKey)
  if (cached) return cached

  if (!GAS_URL || GAS_URL.includes('GANTI')) {
    console.warn('GAS_API_URL belum dikonfigurasi, returning empty array')
    return [] as unknown as T
  }

  const url = new URL(GAS_URL)
  url.searchParams.set('action', action)
  url.searchParams.set('secret', GAS_SECRET)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), { next: { revalidate: ttl } })
  if (!res.ok) throw new Error(`GAS API error: ${res.status}`)

  const json = await res.json()
  if (!json.success) throw new Error(json.error || 'GAS error')

  setCached(cacheKey, json.data as T, ttl)
  return json.data as T
}

function mapProject(row: SheetRow): Project {
  return {
    id: String(row['ID'] || ''), slug: String(row['Slug'] || ''),
    name: String(row['Nama Proyek'] || ''), developer: String(row['Developer'] || ''),
    location: String(row['Lokasi'] || ''), city: String(row['Kota'] || ''),
    province: String(row['Provinsi'] || ''),
    priceMin: Number(row['Harga Min'] || 0), priceMax: Number(row['Harga Max'] || 0),
    type: (row['Tipe'] as Project['type']) || 'Perumahan',
    status: (row['Status'] as Project['status']) || 'Aktif',
    description: String(row['Deskripsi'] || ''),
    coverImage: String(row['Cover Image'] || ''),
    images: String(row['Gambar'] || '').split(',').map(s => s.trim()).filter(Boolean),
    specs: {
      luasTanah: row['LT'] ? String(row['LT']) : undefined,
      luasBangunan: row['LB'] ? String(row['LB']) : undefined,
      kamarTidur: row['KT'] ? Number(row['KT']) : undefined,
      kamarMandi: row['KM'] ? Number(row['KM']) : undefined,
      carport: row['CP'] ? Number(row['CP']) : undefined,
    },
    facilities: String(row['Fasilitas'] || '').split(',').map(s => s.trim()).filter(Boolean),
    agentId: String(row['Agent ID'] || ''),
    createdAt: String(row['Created At'] || ''), updatedAt: String(row['Updated At'] || ''),
  }
}

function mapListing(row: SheetRow): Listing {
  return {
    id: String(row['ID'] || ''), slug: String(row['Slug'] || ''),
    title: String(row['Judul'] || ''),
    type: (row['Tipe'] as Listing['type']) || 'Sale',
    propertyType: (row['Tipe Properti'] as Listing['propertyType']) || 'Rumah',
    price: Number(row['Harga'] || 0),
    priceUnit: (row['Satuan Harga'] as Listing['priceUnit']) || 'Jual',
    location: String(row['Lokasi'] || ''), address: String(row['Alamat'] || ''),
    city: String(row['Kota'] || ''), province: String(row['Provinsi'] || ''),
    luasTanah: Number(row['LT'] || 0), luasBangunan: Number(row['LB'] || 0),
    kamarTidur: Number(row['KT'] || 0), kamarMandi: Number(row['KM'] || 0),
    carport: Number(row['CP'] || 0), lantai: Number(row['Lantai'] || 1),
    kondisi: (row['Kondisi'] as Listing['kondisi']) || 'Bagus',
    sertifikat: (row['Sertifikat'] as Listing['sertifikat']) || 'SHM',
    description: String(row['Deskripsi'] || ''),
    coverImage: String(row['Cover Image'] || ''),
    images: String(row['Gambar'] || '').split(',').map(s => s.trim()).filter(Boolean),
    agentId: String(row['Agent ID'] || ''), agentName: String(row['Nama Agen'] || ''),
    agentPhone: String(row['WA Agen'] || ''), agentPhoto: String(row['Foto Agen'] || ''),
    viewCount: Number(row['Views'] || 0), leadCount: Number(row['Leads'] || 0),
    status: (row['Status'] as Listing['status']) || 'Aktif',
    featured: row['Featured'] === 'TRUE' || row['Featured'] === true,
    createdAt: String(row['Created At'] || ''), updatedAt: String(row['Updated At'] || ''),
  }
}

function mapAgent(row: SheetRow): Agent {
  return {
    id: String(row['ID'] || ''), name: String(row['Nama'] || ''),
    photo: String(row['Foto'] || ''), phone: String(row['Telepon'] || ''),
    email: String(row['Email'] || ''), whatsapp: String(row['WhatsApp'] || ''),
    bio: String(row['Bio'] || ''),
    specialization: String(row['Spesialisasi'] || '').split(',').map(s => s.trim()).filter(Boolean),
    areas: String(row['Area'] || '').split(',').map(s => s.trim()).filter(Boolean),
    totalListings: Number(row['Total Listing'] || 0), totalDeals: Number(row['Total Deal'] || 0),
    rating: Number(row['Rating'] || 5),
    verified: row['Verified'] === 'TRUE' || row['Verified'] === true,
    joinDate: String(row['Join Date'] || ''),
    instagram: row['Instagram'] ? String(row['Instagram']) : undefined,
    linkedin: row['LinkedIn'] ? String(row['LinkedIn']) : undefined,
  }
}

function mapNews(row: SheetRow): News {
  return {
    id: String(row['ID'] || ''), slug: String(row['Slug'] || ''),
    title: String(row['Judul'] || ''), summary: String(row['Ringkasan'] || ''),
    content: String(row['Konten'] || ''), coverImage: String(row['Cover Image'] || ''),
    category: (row['Kategori'] as News['category']) || 'Berita Properti',
    author: String(row['Penulis'] || ''), publishedAt: String(row['Tanggal'] || ''),
    tags: String(row['Tags'] || '').split(',').map(s => s.trim()).filter(Boolean),
    viewCount: Number(row['Views'] || 0),
  }
}

export async function getProjects(): Promise<Project[]> {
  try { const rows = await fetchFromGAS<SheetRow[]>('getProjects', {}, 300); return rows.map(mapProject) }
  catch { return [] }
}
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const projects = await getProjects()
  return projects.find(p => p.slug === slug) || null
}
export async function getListings(filter?: { type?: 'Sale' | 'Rent'; city?: string; propertyType?: string; featured?: boolean }): Promise<Listing[]> {
  try {
    const rows = await fetchFromGAS<SheetRow[]>('getListings', {}, 300)
    let listings = rows.map(mapListing).filter(l => l.status === 'Aktif')
    if (filter?.type) listings = listings.filter(l => l.type === filter.type)
    if (filter?.city) listings = listings.filter(l => l.city === filter.city)
    if (filter?.propertyType) listings = listings.filter(l => l.propertyType === filter.propertyType)
    if (filter?.featured) listings = listings.filter(l => l.featured)
    return listings
  } catch { return [] }
}
export async function getListingBySlug(slug: string): Promise<Listing | null> {
  const listings = await getListings()
  return listings.find(l => l.slug === slug) || null
}
export async function getAgents(): Promise<Agent[]> {
  try { const rows = await fetchFromGAS<SheetRow[]>('getAgents', {}, 600); return rows.map(mapAgent) }
  catch { return [] }
}
export async function getAgentById(id: string): Promise<Agent | null> {
  const agents = await getAgents()
  return agents.find(a => a.id === id) || null
}
export async function getNews(limit?: number): Promise<News[]> {
  try {
    const rows = await fetchFromGAS<SheetRow[]>('getNews', {}, 600)
    const news = rows.map(mapNews).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    return limit ? news.slice(0, limit) : news
  } catch { return [] }
}

export function formatPrice(price: number): string {
  if (price >= 1_000_000_000) return `Rp ${(price / 1_000_000_000).toFixed(1).replace('.0', '')} M`
  if (price >= 1_000_000) return `Rp ${(price / 1_000_000).toFixed(0)} Jt`
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
}

export function buildWALink(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, '')
  const normalized = clean.startsWith('0') ? '62' + clean.slice(1) : clean
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}
SHEETSLIB
echo "✅ lib/sheets.ts"

# ── src/lib/calculator.ts ─────────────────────────────────
cat > $TARGET/src/lib/calculator.ts << 'CALC'
import { KPRParams, KPRResult } from '@/types'

export function calculateKPRKonvensional(p: KPRParams): KPRResult {
  const pokok = p.hargaProperti - p.uangMuka
  const bm = p.bungaTahunan / 100 / 12
  const tb = p.tenor * 12
  const angsuran = bm === 0 ? pokok / tb : (pokok * bm * Math.pow(1 + bm, tb)) / (Math.pow(1 + bm, tb) - 1)
  const breakdown: KPRResult['breakdown'] = []
  let sisa = pokok
  for (let i = 1; i <= tb; i++) {
    const bunga = sisa * bm; const pk = angsuran - bunga; sisa -= pk
    breakdown.push({ bulan: i, angsuran: Math.round(angsuran), pokok: Math.round(pk), bunga: Math.round(bunga), sisaPokok: Math.max(0, Math.round(sisa)) })
  }
  const total = angsuran * tb
  return { pokokPinjaman: Math.round(pokok), angsuranPokok: Math.round(pokok/tb), angsuranBunga: Math.round(angsuran-pokok/tb), totalAngsuran: Math.round(angsuran), totalPembayaran: Math.round(total), totalBunga: Math.round(total-pokok), breakdown }
}

export function calculateKPRSyariah(p: KPRParams): KPRResult {
  const pokok = p.hargaProperti - p.uangMuka
  const tb = p.tenor * 12
  const margin = pokok * (p.bungaTahunan / 100) * p.tenor
  const hargaJual = pokok + margin
  const angsuran = hargaJual / tb
  const breakdown: KPRResult['breakdown'] = []
  for (let i = 1; i <= tb; i++) {
    const pk = pokok / tb; const m = margin / tb
    breakdown.push({ bulan: i, angsuran: Math.round(angsuran), pokok: Math.round(pk), bunga: Math.round(m), sisaPokok: Math.round(pokok - pk * i) })
  }
  return { pokokPinjaman: Math.round(pokok), angsuranPokok: Math.round(pokok/tb), angsuranBunga: Math.round(margin/tb), totalAngsuran: Math.round(angsuran), totalPembayaran: Math.round(hargaJual), totalBunga: Math.round(margin), breakdown }
}

export function calculate(p: KPRParams): KPRResult {
  if (p.jenis === 'syariah') return calculateKPRSyariah(p)
  if (p.jenis === 'kmg') return calculateKPRKonvensional({ ...p, bungaTahunan: p.bungaTahunan + 2 })
  return calculateKPRKonvensional(p)
}

export const BANK_PRESETS = [
  { bank: 'BTN',     type: 'konvensional', rate: 7.5,  maxTenor: 30, notes: 'Subsidi FLPP tersedia' },
  { bank: 'BCA',     type: 'konvensional', rate: 7.75, maxTenor: 25, notes: 'Fixed 2 tahun pertama' },
  { bank: 'Mandiri', type: 'konvensional', rate: 7.5,  maxTenor: 30, notes: 'KPR Mandiri Griya' },
  { bank: 'BRI',     type: 'konvensional', rate: 7.25, maxTenor: 30, notes: 'BRI Griya' },
  { bank: 'BSI',     type: 'syariah',      rate: 8.0,  maxTenor: 30, notes: 'Akad Murabahah' },
  { bank: 'BNI Syariah', type: 'syariah', rate: 8.5,  maxTenor: 25, notes: 'Griya iB Hasanah' },
] as const
CALC
echo "✅ lib/calculator.ts"

# ── globals.css ───────────────────────────────────────────
cat > $TARGET/src/app/globals.css << 'CSS'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { --navy: #0a2342; --gold: #c9a84c; --cream: #f8f4ed; }

@layer base {
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
  h1,h2,h3,h4,h5,h6 { @apply font-display text-primary-900 leading-tight; }
  p { @apply leading-relaxed; }
}

@layer components {
  .btn-primary { @apply inline-flex items-center gap-2 px-6 py-3 bg-primary-900 text-white font-body font-semibold rounded-lg hover:bg-primary-800 transition-all duration-200 shadow-navy; }
  .btn-gold { @apply inline-flex items-center gap-2 px-6 py-3 bg-gold text-primary-900 font-body font-bold rounded-lg hover:bg-gold-light transition-all duration-200; }
  .btn-outline { @apply inline-flex items-center gap-2 px-6 py-3 border-2 border-primary-900 text-primary-900 font-body font-semibold rounded-lg hover:bg-primary-900 hover:text-white transition-all duration-200; }
  .btn-wa { @apply inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-body font-bold rounded-lg hover:bg-[#1da851] transition-all duration-200; }
  .card { @apply bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border border-gray-100; }
  .section-title { @apply text-3xl md:text-4xl font-display font-bold text-primary-900; }
  .section-subtitle { @apply text-lg text-gray-500 font-body mt-3 max-w-2xl; }
  .badge { @apply inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold; }
  .badge-sale { @apply badge bg-emerald-100 text-emerald-800; }
  .badge-rent { @apply badge bg-blue-100 text-blue-800; }
  .badge-new  { @apply badge bg-gold text-primary-900; }
  .price-display { @apply text-2xl font-display font-bold text-primary-900; }
  .input-field { @apply w-full px-4 py-3 border border-gray-200 rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white placeholder-gray-400 transition-all duration-200; }
  .label-field { @apply block text-sm font-semibold text-gray-700 mb-1.5; }
  .section-wrapper { @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8; }
  .divider-gold { @apply w-16 h-1 bg-gold rounded-full; }
}

@layer utilities {
  .text-gold { color: var(--gold); }
  .bg-cream  { background-color: var(--cream); }
  .bg-navy-texture { background-color: var(--navy); }
  .text-gradient-gold {
    background: linear-gradient(135deg, #c9a84c, #e8c96a, #c9a84c);
    -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  }
  .animate-delay-100 { animation-delay: 100ms; }
  .animate-delay-200 { animation-delay: 200ms; }
  .animate-delay-300 { animation-delay: 300ms; }
  .animate-delay-400 { animation-delay: 400ms; }
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #f1f5f9; }
::-webkit-scrollbar-thumb { background: #0a2342; border-radius: 3px; }

.property-card:hover .property-image { transform: scale(1.05); }
.property-image { transition: transform 0.4s cubic-bezier(0.4,0,0.2,1); }
.skeleton { @apply animate-pulse bg-gray-200 rounded; }
CSS
echo "✅ globals.css"

# ── layout.tsx ────────────────────────────────────────────
cat > $TARGET/src/app/layout.tsx << 'LAYOUT'
import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' })
const dmSans   = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://mansionrealty.co.id'),
  title: { default: 'Mansion Realty | Properti Impian Anda', template: '%s | Mansion Realty' },
  description: 'Temukan properti impian Anda bersama Mansion Realty. Rumah, apartemen, kavling, dan properti komersial terbaik.',
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-body bg-white text-gray-900 antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
LAYOUT
echo "✅ layout.tsx"

# ── Navbar.tsx ────────────────────────────────────────────
cat > $TARGET/src/components/layout/Navbar.tsx << 'NAVBAR'
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
  const pathname = usePathname()

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const waOffice = process.env.NEXT_PUBLIC_WA_OFFICE || '6281234567890'

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || menuOpen ? 'bg-primary-900 shadow-navy py-3' : 'bg-primary-900/95 backdrop-blur-sm py-4'}`}>
      <div className="section-wrapper flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="text-primary-900 font-display font-bold text-lg">M</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-white font-display font-bold text-xl">Mansion</span>
            <span className="text-gold font-display text-xl ml-1">Realty</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}
              className={`text-sm font-semibold transition-colors ${pathname === link.href ? 'text-gold' : 'text-white/80 hover:text-white'}`}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/listings/titip" className="hidden md:inline-flex btn-gold text-sm px-4 py-2">+ Titip Listing</Link>
          <a href={`https://wa.me/${waOffice}`} target="_blank" rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white transition-colors">
            <svg className="w-4 h-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            WA Kantor
          </a>
          <button className="lg:hidden p-2 text-white" onClick={() => setMenuOpen(v => !v)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>}
            </svg>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="lg:hidden bg-primary-900 border-t border-white/10 py-4">
          <div className="section-wrapper flex flex-col gap-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                className={`py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${pathname === link.href ? 'text-gold bg-white/10' : 'text-white/80 hover:text-white hover:bg-white/5'}`}>
                {link.label}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-white/10">
              <Link href="/listings/titip" className="btn-gold text-center block" onClick={() => setMenuOpen(false)}>+ Titip Listing</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
NAVBAR
echo "✅ Navbar.tsx"

# ── Footer.tsx ────────────────────────────────────────────
cat > $TARGET/src/components/layout/Footer.tsx << 'FOOTER'
import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()
  const wa   = process.env.NEXT_PUBLIC_WA_OFFICE || '6281234567890'
  return (
    <footer className="bg-primary-900 text-white">
      <div className="bg-gold py-8">
        <div className="section-wrapper flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-2xl text-primary-900">Siap menemukan properti impian Anda?</h3>
            <p className="text-primary-900/70 mt-1">Konsultasikan kebutuhan properti Anda dengan agen kami.</p>
          </div>
          <a href={`https://wa.me/${wa}?text=Halo%20Mansion%20Realty%2C%20saya%20ingin%20konsultasi`} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 px-6 py-3 bg-primary-900 text-white font-bold rounded-lg hover:bg-primary-800 transition-colors flex items-center gap-2">
            💬 Konsultasi Gratis via WhatsApp
          </a>
        </div>
      </div>
      <div className="section-wrapper py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center">
                <span className="text-primary-900 font-display font-bold text-lg">M</span>
              </div>
              <span className="text-white font-display font-bold text-xl">Mansion <span className="text-gold">Realty</span></span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">Agen properti terpercaya untuk hunian dan investasi terbaik di Indonesia.</p>
            <div className="mt-4 space-y-1 text-sm text-white/60">
              <p>📍 {process.env.NEXT_PUBLIC_COMPANY_ADDRESS || 'Jakarta Selatan'}</p>
              <p>📞 {process.env.NEXT_PUBLIC_COMPANY_PHONE || '+6221-1234-5678'}</p>
              <p>✉️ {process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'info@mansionrealty.co.id'}</p>
            </div>
          </div>
          {[
            { title: 'Properti', links: [['Proyek Baru','/projects'],['Rumah Dijual','/listings?type=Sale'],['Apartemen','/listings?type=Sale&propertyType=Apartemen'],['Disewa','/listings?type=Rent'],['Kavling','/listings?propertyType=Kavling']] },
            { title: 'Layanan',  links: [['KPR & Pembiayaan','/calculator'],['Titip Listing','/listings/titip'],['Daftar Agen','/agents'],['Berita Properti','/news'],['Tentang Kami','/about']] },
            { title: 'Lainnya', links: [['Karir','/career'],['Kebijakan Privasi','/privacy'],['Syarat & Ketentuan','/terms'],['Hubungi Kami','/contact']] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-white font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(([label, href]) => (
                  <li key={href}><Link href={href} className="text-sm text-white/60 hover:text-gold transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/40">
          <p>© {year} Mansion Realty. Semua hak dilindungi.</p>
          <p>Built with ❤️ for Indonesian Property Market</p>
        </div>
      </div>
    </footer>
  )
}
FOOTER
echo "✅ Footer.tsx"

# ── PropertyCard.tsx ──────────────────────────────────────
cat > $TARGET/src/components/property/PropertyCard.tsx << 'PROPCARD'
import Link from 'next/link'
import Image from 'next/image'
import { Listing, Project } from '@/types'
import { formatPrice, buildWALink } from '@/lib/sheets'

export function ListingCard({ listing, className = '' }: { listing: Listing; className?: string }) {
  const wa = buildWALink(listing.agentPhone, `Halo ${listing.agentName}, saya tertarik dengan: ${listing.title}. Info lebih lanjut?`)
  return (
    <div className={`card group property-card ${className}`}>
      <div className="relative h-52 overflow-hidden">
        {listing.coverImage ? (
          <Image src={listing.coverImage} alt={listing.title} fill className="object-cover property-image" sizes="(max-width: 768px) 100vw, 33vw"/>
        ) : (
          <div className="w-full h-full bg-primary-100 flex items-center justify-center"><span className="text-4xl">🏠</span></div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={listing.type === 'Sale' ? 'badge-sale' : 'badge-rent'}>{listing.type === 'Sale' ? 'Dijual' : 'Disewa'}</span>
          {listing.featured && <span className="badge-new">⭐ Unggulan</span>}
        </div>
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
          <span className="text-white text-xs font-semibold">{listing.agentName}</span>
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-400 mb-1">📍 {listing.location}, {listing.city}</p>
        <Link href={`/listings/${listing.slug}`}>
          <h3 className="font-display font-semibold text-primary-900 hover:text-primary-700 transition-colors line-clamp-2 mb-2 leading-snug">{listing.title}</h3>
        </Link>
        <p className="price-display mb-3">{formatPrice(listing.price)}</p>
        <div className="flex gap-3 text-xs text-gray-500 border-t border-gray-100 pt-3 mb-3">
          {listing.luasTanah > 0 && <span>🏠 {listing.luasTanah}m²</span>}
          {listing.luasBangunan > 0 && <span>📐 {listing.luasBangunan}m²</span>}
          {listing.kamarTidur > 0 && <span>🛏 {listing.kamarTidur}</span>}
          {listing.kamarMandi > 0 && <span>🚿 {listing.kamarMandi}</span>}
        </div>
        <div className="flex gap-2">
          <Link href={`/listings/${listing.slug}`} className="flex-1 text-center py-2 text-sm font-semibold text-primary-900 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">Detail</Link>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2 text-sm font-semibold text-white bg-[#25D366] rounded-lg hover:bg-[#1da851] transition-colors">💬 WA Agen</a>
        </div>
      </div>
    </div>
  )
}

export function ProjectCard({ project, className = '' }: { project: Project; className?: string }) {
  return (
    <div className={`card group property-card ${className}`}>
      <div className="relative h-52 overflow-hidden">
        {project.coverImage ? (
          <Image src={project.coverImage} alt={project.name} fill className="object-cover property-image" sizes="(max-width: 768px) 100vw, 33vw"/>
        ) : (
          <div className="w-full h-full bg-primary-900 flex items-center justify-center"><span className="text-4xl">🏗</span></div>
        )}
        <div className="absolute top-3 left-3">
          <span className="badge bg-primary-900 text-white">{project.type}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <p className="text-white/70 text-xs">Developer</p>
          <p className="text-white font-semibold text-sm">{project.developer}</p>
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-400 mb-1">📍 {project.location}, {project.city}</p>
        <Link href={`/projects/${project.slug}`}>
          <h3 className="font-display font-semibold text-primary-900 hover:text-primary-700 transition-colors leading-snug mb-2">{project.name}</h3>
        </Link>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{project.description}</p>
        <div className="bg-primary-50 rounded-lg p-2.5 mb-3">
          <p className="text-xs text-gray-500">Mulai dari</p>
          <p className="price-display text-lg">{formatPrice(project.priceMin)}</p>
        </div>
        <Link href={`/projects/${project.slug}`} className="block w-full text-center btn-primary py-2.5 text-sm">Lihat Detail Proyek</Link>
      </div>
    </div>
  )
}
PROPCARD
echo "✅ PropertyCard.tsx"

# ── page.tsx (Beranda) ────────────────────────────────────
cat > $TARGET/src/app/page.tsx << 'HOMEPAGE'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getProjects, getListings, getNews } from '@/lib/sheets'
import { ProjectCard, ListingCard } from '@/components/property/PropertyCard'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Mansion Realty | Properti Impian Anda, Investasi Terbaik Anda',
  description: 'Temukan proyek perumahan, rumah dijual, dan properti premium bersama agen terpercaya Mansion Realty.',
}

export default async function HomePage() {
  const [projects, saleListings, rentListings, news] = await Promise.all([
    getProjects(), getListings({ type: 'Sale' }), getListings({ type: 'Rent' }), getNews(3),
  ])
  const wa = process.env.NEXT_PUBLIC_WA_OFFICE || '6281234567890'

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center bg-navy-texture overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800" />
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-5" style={{backgroundImage:'repeating-linear-gradient(45deg,#c9a84c 0,#c9a84c 1px,transparent 0,transparent 50%)',backgroundSize:'20px 20px'}}/>
        <div className="section-wrapper relative z-10 py-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="divider-gold" />
              <span className="text-gold font-semibold text-sm uppercase tracking-widest">Agen Properti Terpercaya</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-tight mb-6">
              Properti Impian <span className="text-gradient-gold">Anda</span>,<br/>Investasi Terbaik
            </h1>
            <p className="text-xl text-white/70 mb-10 max-w-xl leading-relaxed">
              Temukan rumah, apartemen, kavling, dan properti komersial premium dengan bantuan agen berpengalaman Mansion Realty.
            </p>
            <div className="flex flex-wrap gap-4 mb-14">
              <Link href="/listings" className="btn-gold px-8 py-4 text-base">🏠 Cari Properti</Link>
              <a href={`https://wa.me/${wa}?text=Halo%20Mansion%20Realty%2C%20saya%20ingin%20konsultasi`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-primary-900 transition-all text-base">
                💬 Konsultasi Gratis
              </a>
            </div>
            <div className="flex flex-wrap gap-8">
              {[{n:`${projects.length}+`,l:'Proyek Aktif'},{n:`${saleListings.length}+`,l:'Listing Dijual'},{n:'50+',l:'Agen'},{n:'1.000+',l:'Transaksi Sukses'}].map(s => (
                <div key={s.l}><div className="text-3xl font-display font-bold text-gold">{s.n}</div><div className="text-sm text-white/60 mt-0.5">{s.l}</div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Proyek Baru */}
      <section className="py-20 bg-white">
        <div className="section-wrapper">
          <div className="flex items-end justify-between mb-10">
            <div><div className="divider-gold mb-3"/><h2 className="section-title">Proyek Baru</h2><p className="section-subtitle">Perumahan baru dari developer terpercaya</p></div>
            <Link href="/projects" className="hidden md:inline-flex btn-outline text-sm">Lihat Semua →</Link>
          </div>
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(0,6).map(p => <ProjectCard key={p.id} project={p}/>)}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-4">🏗</div><p>Data proyek dari CRM Mansion akan tampil di sini.</p></div>
          )}
        </div>
      </section>

      {/* Properti Dijual */}
      <section className="py-20 bg-gray-50">
        <div className="section-wrapper">
          <div className="flex items-end justify-between mb-10">
            <div><div className="divider-gold mb-3"/><h2 className="section-title">Properti Dijual</h2><p className="section-subtitle">Pilihan properti terbaik siap dihuni dan diinvestasikan</p></div>
            <Link href="/listings?type=Sale" className="hidden md:inline-flex btn-outline text-sm">Lihat Semua →</Link>
          </div>
          {saleListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {saleListings.slice(0,6).map(l => <ListingCard key={l.id} listing={l}/>)}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-4">🏠</div><p>Data listing dari CRM Mansion akan tampil di sini.</p></div>
          )}
        </div>
      </section>

      {/* Titip Listing CTA */}
      <section className="py-20 bg-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'repeating-linear-gradient(45deg,#c9a84c 0,#c9a84c 1px,transparent 0,transparent 50%)',backgroundSize:'24px 24px'}}/>
        <div className="section-wrapper relative z-10 text-center">
          <div className="divider-gold mx-auto mb-4"/>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Punya Properti untuk Dijual atau Disewakan?</h2>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">Titipkan listing properti Anda kepada agen profesional Mansion Realty. Gratis, mudah, dan cepat terjual.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/listings/titip" className="btn-gold px-8 py-4">📋 Titip Listing Sekarang</Link>
            <a href={`https://wa.me/${wa}?text=Halo%20Mansion%20Realty%2C%20saya%20ingin%20titip%20listing`} target="_blank" rel="noopener noreferrer" className="btn-wa px-8 py-4">💬 Chat via WhatsApp</a>
          </div>
        </div>
      </section>

      {/* KPR CTA */}
      <section className="py-20 bg-cream">
        <div className="section-wrapper">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="divider-gold mb-4"/>
              <h2 className="section-title mb-4">Rencanakan Pembiayaan Properti Anda</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">Gunakan kalkulator KPR kami untuk menghitung cicilan konvensional, syariah, KMG, dan take over secara akurat.</p>
              <Link href="/calculator" className="btn-primary">🧮 Hitung Simulasi KPR</Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[['🏦','KPR Konvensional','Angsuran anuitas bank umum'],['☪️','KPR Syariah','Akad murabahah bebas riba'],['💰','KMG','Kredit multiguna properti'],['🔄','Take Over','Alihkan KPR lebih ringan']].map(([icon,label,desc]) => (
                <Link key={label as string} href="/calculator" className="p-4 bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1">
                  <div className="text-2xl mb-2">{icon}</div>
                  <div className="font-display font-semibold text-primary-900 text-sm">{label}</div>
                  <div className="text-xs text-gray-500 mt-1">{desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Berita */}
      {news.length > 0 && (
        <section className="py-20 bg-white">
          <div className="section-wrapper">
            <div className="flex items-end justify-between mb-10">
              <div><div className="divider-gold mb-3"/><h2 className="section-title">Berita & Artikel Properti</h2></div>
              <Link href="/news" className="hidden md:inline-flex btn-outline text-sm">Lihat Semua →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {news.map(a => (
                <Link key={a.id} href={`/news/${a.slug}`} className="card hover:shadow-card-hover transition-all duration-300">
                  <div className="relative h-48 overflow-hidden">
                    {a.coverImage ? <img src={a.coverImage} alt={a.title} className="object-cover w-full h-full property-image"/> : <div className="w-full h-full bg-primary-100 flex items-center justify-center text-4xl">📰</div>}
                    <span className="absolute top-3 left-3 badge bg-primary-900 text-white">{a.category}</span>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-400 mb-2">{new Date(a.publishedAt).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</p>
                    <h3 className="font-display font-semibold text-primary-900 line-clamp-2">{a.title}</h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{a.summary}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
HOMEPAGE
echo "✅ page.tsx (Beranda)"

# ── listings/page.tsx ─────────────────────────────────────
cat > $TARGET/src/app/listings/page.tsx << 'LISTPAGE'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getListings } from '@/lib/sheets'
import { ListingCard } from '@/components/property/PropertyCard'

export const revalidate = 300
export const metadata: Metadata = { title: 'Properti Dijual & Disewa | Mansion Realty' }

export default async function ListingsPage({ searchParams }: { searchParams: { type?: string; propertyType?: string } }) {
  const { type, propertyType } = searchParams
  const listings = await getListings({ type: type as 'Sale' | 'Rent', propertyType })
  const title = type === 'Sale' ? 'Properti Dijual' : type === 'Rent' ? 'Properti Disewa' : 'Semua Listing'

  return (
    <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
      <div className="section-wrapper">
        <div className="mb-8"><div className="divider-gold mb-3"/><h1 className="section-title">{title}</h1><p className="text-gray-500 mt-2">{listings.length} properti ditemukan</p></div>
        <div className="flex flex-wrap gap-3 mb-8">
          {[['Semua','/listings'],['Dijual','/listings?type=Sale'],['Disewa','/listings?type=Rent']].map(([label,href]) => (
            <Link key={href as string} href={href as string}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${(href === '/listings' && !type) || (href as string).includes(type||'XX') ? 'bg-primary-900 text-white border-primary-900' : 'border-gray-200 text-gray-600 hover:border-primary-300 bg-white'}`}>
              {label}
            </Link>
          ))}
          {['Rumah','Apartemen','Ruko','Kavling'].map(pt => (
            <Link key={pt} href={`/listings${type?`?type=${type}&`:'?'}propertyType=${pt}`}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${propertyType===pt?'bg-gold text-primary-900 border-gold':'border-gray-200 text-gray-600 hover:border-gold bg-white'}`}>
              {pt}
            </Link>
          ))}
        </div>
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(l => <ListingCard key={l.id} listing={l}/>)}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-display font-bold text-primary-900 text-xl mb-2">Properti tidak ditemukan</h3>
            <Link href="/listings" className="btn-primary mt-4">Lihat Semua Listing</Link>
          </div>
        )}
      </div>
    </div>
  )
}
LISTPAGE

# ── listings/titip/page.tsx ───────────────────────────────
cat > "$TARGET/src/app/listings/titip/page.tsx" << 'TITIP'
'use client'
import { useState } from 'react'

export default function TitipListingPage() {
  const [form, setForm] = useState({ name:'', phone:'', email:'', propertyType:'Rumah', address:'', price:'', description:'' })
  const [done, setDone] = useState(false)
  const wa = process.env.NEXT_PUBLIC_WA_OFFICE || '6281234567890'

  const handleWA = () => {
    const msg = `*Titip Listing Properti*\n\nNama: ${form.name}\nTelepon: ${form.phone}\nTipe: ${form.propertyType}\nAlamat: ${form.address}\nHarga: ${form.price}\nDeskripsi: ${form.description}`
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank')
    setDone(true)
  }

  return (
    <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
      <div className="section-wrapper max-w-2xl">
        <div className="text-center mb-8"><div className="divider-gold mx-auto mb-3"/><h1 className="section-title">Titip Listing Properti</h1><p className="section-subtitle mx-auto">Percayakan penjualan properti Anda kepada agen profesional Mansion Realty</p></div>
        {!done ? (
          <div className="card p-8 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label-field">Nama Lengkap *</label><input className="input-field" placeholder="John Doe" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
              <div><label className="label-field">No. WhatsApp *</label><input className="input-field" placeholder="08123456789" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}/></div>
            </div>
            <div><label className="label-field">Email</label><input type="email" className="input-field" placeholder="john@email.com" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/></div>
            <div><label className="label-field">Tipe Properti *</label>
              <select className="input-field" value={form.propertyType} onChange={e=>setForm(p=>({...p,propertyType:e.target.value}))}>
                {['Rumah','Apartemen','Ruko','Kavling','Gedung','Gudang','Lainnya'].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="label-field">Alamat / Lokasi *</label><input className="input-field" placeholder="Jl. Contoh No. 1, Jakarta Selatan" value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))}/></div>
            <div><label className="label-field">Harga yang Diinginkan</label><input className="input-field" placeholder="cth: 850.000.000" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))}/></div>
            <div><label className="label-field">Deskripsi Singkat</label><textarea className="input-field h-28 resize-none" placeholder="Kondisi properti, spesifikasi, dll..." value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}/></div>
            <button onClick={handleWA} className="btn-wa w-full justify-center py-4">💬 Kirim via WhatsApp</button>
          </div>
        ) : (
          <div className="card p-12 text-center"><div className="text-6xl mb-4">✅</div><h2 className="font-display font-bold text-primary-900 text-2xl mb-3">Terima Kasih!</h2><p className="text-gray-600 mb-6">Tim agen kami akan segera menghubungi Anda.</p><button onClick={()=>setDone(false)} className="btn-outline">Titip Lagi</button></div>
        )}
      </div>
    </div>
  )
}
TITIP

# ── calculator/page.tsx ───────────────────────────────────
cat > $TARGET/src/app/calculator/page.tsx << 'CALCPAGE'
'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import { calculate, BANK_PRESETS } from '@/lib/calculator'
import { KPRParams, KPRResult } from '@/types'

type Tab = 'konvensional' | 'syariah' | 'kmg' | 'takeover'
const TABS = [
  { id: 'konvensional' as Tab, label: 'KPR Konvensional', icon: '🏦' },
  { id: 'syariah'      as Tab, label: 'KPR Syariah',      icon: '☪️'  },
  { id: 'kmg'          as Tab, label: 'KMG',              icon: '💰' },
  { id: 'takeover'     as Tab, label: 'Take Over',        icon: '🔄' },
]

function formatRp(n: number) { return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n) }

export default function CalculatorPage() {
  const [tab, setTab]    = useState<Tab>('konvensional')
  const [params, setParams] = useState<KPRParams>({ hargaProperti:800_000_000, uangMuka:160_000_000, tenor:20, bungaTahunan:7.5, jenis:'konvensional' })
  const [result, setResult] = useState<KPRResult|null>(null)
  const [showTable, setShowTable] = useState(false)

  const handleCalc = useCallback(() => { setResult(calculate({...params, jenis:tab})); setShowTable(false) }, [params, tab])
  const dp = Math.round((params.uangMuka / params.hargaProperti) * 100)
  const wa = process.env.NEXT_PUBLIC_WA_OFFICE || '6281234567890'

  return (
    <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
      <div className="section-wrapper">
        <div className="text-center mb-10"><div className="divider-gold mx-auto mb-3"/><h1 className="section-title">Kalkulator KPR & Pembiayaan</h1><p className="section-subtitle mx-auto">Simulasikan cicilan properti dengan berbagai skema pembiayaan</p></div>
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-2 shadow-card grid grid-cols-2 gap-1">
              {TABS.map(t => (
                <button key={t.id} onClick={()=>{setTab(t.id);setResult(null)}}
                  className={`py-3 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${tab===t.id?'bg-primary-900 text-white':'text-gray-500 hover:text-primary-900 hover:bg-gray-50'}`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-card space-y-5">
              <div>
                <label className="label-field">Harga Properti</label>
                <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">Rp</span>
                  <input type="text" className="input-field pl-10" value={new Intl.NumberFormat('id-ID').format(params.hargaProperti)}
                    onChange={e=>setParams(p=>({...p,hargaProperti:Number(e.target.value.replace(/\D/g,''))}))}/>
                </div>
              </div>
              <div>
                <label className="label-field">Uang Muka (DP) — {dp}%</label>
                <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">Rp</span>
                  <input type="text" className="input-field pl-10" value={new Intl.NumberFormat('id-ID').format(params.uangMuka)}
                    onChange={e=>setParams(p=>({...p,uangMuka:Number(e.target.value.replace(/\D/g,''))}))}/>
                </div>
              </div>
              <div>
                <label className="label-field">Tenor: <strong>{params.tenor} tahun</strong></label>
                <input type="range" min={1} max={30} value={params.tenor} onChange={e=>setParams(p=>({...p,tenor:Number(e.target.value)}))} className="w-full accent-primary-900"/>
                <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1 tahun</span><span>30 tahun</span></div>
              </div>
              <div>
                <label className="label-field">{tab==='syariah'?'Margin':'Bunga'} Tahunan: <strong>{params.bungaTahunan}%</strong></label>
                <input type="range" min={1} max={15} step={0.25} value={params.bungaTahunan} onChange={e=>setParams(p=>({...p,bungaTahunan:Number(e.target.value)}))} className="w-full accent-primary-900"/>
              </div>
              <div>
                <label className="label-field">Acuan Bank</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {BANK_PRESETS.filter(b=>tab==='syariah'?b.type==='syariah':b.type==='konvensional').map(b=>(
                    <button key={b.bank} onClick={()=>setParams(p=>({...p,bungaTahunan:b.rate,tenor:Math.min(p.tenor,b.maxTenor)}))}
                      className="text-left p-2 rounded-lg border border-gray-100 hover:border-primary-300 hover:bg-primary-50 transition-colors text-xs">
                      <div className="font-bold text-primary-900">{b.bank}</div>
                      <div className="text-gray-500">{b.rate}% / {b.maxTenor}th</div>
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleCalc} className="btn-primary w-full justify-center py-4 text-base">🧮 Hitung Simulasi</button>
            </div>
          </div>
          <div className="lg:col-span-3 space-y-6">
            {result ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {[{l:'Angsuran / Bulan',v:formatRp(result.totalAngsuran),h:true},{l:'Pokok Pinjaman',v:formatRp(result.pokokPinjaman)},{l:'Total Pembayaran',v:formatRp(result.totalPembayaran)},{l:'Total Bunga/Margin',v:formatRp(result.totalBunga)}].map(item=>(
                    <div key={item.l} className={`rounded-2xl p-5 ${item.h?'bg-primary-900 text-white shadow-navy':'bg-white shadow-card'}`}>
                      <p className={`text-xs font-semibold mb-1 ${item.h?'text-white/70':'text-gray-400'}`}>{item.l}</p>
                      <p className={`text-xl font-display font-bold ${item.h?'text-gold':'text-primary-900'}`}>{item.v}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-display font-bold text-primary-900">Tabel Amortisasi</h3>
                    <button onClick={()=>setShowTable(v=>!v)} className="text-sm text-primary-700 font-semibold">{showTable?'▲ Sembunyikan':'▼ Lihat Tabel'}</button>
                  </div>
                  {showTable && (
                    <div className="overflow-x-auto max-h-80 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-primary-900 text-white sticky top-0"><tr><th className="px-3 py-2 text-left">Bln</th><th className="px-3 py-2 text-right">Angsuran</th><th className="px-3 py-2 text-right">Pokok</th><th className="px-3 py-2 text-right">Bunga</th><th className="px-3 py-2 text-right">Sisa Pokok</th></tr></thead>
                        <tbody>
                          {result.breakdown.map((r,i)=>(
                            <tr key={r.bulan} className={i%2===0?'bg-gray-50':'bg-white'}>
                              <td className="px-3 py-1.5 text-gray-500">{r.bulan}</td>
                              <td className="px-3 py-1.5 text-right font-semibold text-primary-900">{formatRp(r.angsuran)}</td>
                              <td className="px-3 py-1.5 text-right text-emerald-700">{formatRp(r.pokok)}</td>
                              <td className="px-3 py-1.5 text-right text-red-500">{formatRp(r.bunga)}</td>
                              <td className="px-3 py-1.5 text-right text-gray-600">{formatRp(r.sisaPokok)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="bg-amber-50 border border-gold/30 rounded-2xl p-5">
                  <p className="font-display font-bold text-primary-900 mb-2">Butuh konsultasi pembiayaan?</p>
                  <a href={`https://wa.me/${wa}?text=Halo%20Mansion%20Realty%2C%20saya%20butuh%20konsultasi%20KPR`} target="_blank" rel="noopener noreferrer" className="btn-wa inline-flex">💬 Konsultasi KPR Gratis</a>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-card p-12 text-center"><div className="text-6xl mb-4">🏦</div><h3 className="font-display font-bold text-primary-900 text-xl mb-2">Simulasikan Cicilan Anda</h3><p className="text-gray-500">Masukkan harga properti dan klik <strong>Hitung Simulasi</strong>.</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
CALCPAGE
echo "✅ calculator/page.tsx"

# ── agents/page.tsx ───────────────────────────────────────
cat > $TARGET/src/app/agents/page.tsx << 'AGENTSPAGE'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAgents, buildWALink } from '@/lib/sheets'

export const revalidate = 600
export const metadata: Metadata = { title: 'Daftar Agen Properti | Mansion Realty' }

export default async function AgentsPage() {
  const agents = await getAgents()
  const wa = process.env.NEXT_PUBLIC_WA_OFFICE || '6281234567890'

  return (
    <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
      <div className="section-wrapper">
        <div className="text-center mb-12"><div className="divider-gold mx-auto mb-3"/><h1 className="section-title">Tim Agen Mansion Realty</h1><p className="section-subtitle mx-auto">Agen berpengalaman, terverifikasi, siap membantu Anda</p></div>
        {agents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {agents.map(agent => {
              const waLink = buildWALink(agent.whatsapp||agent.phone, `Halo ${agent.name}, saya ingin konsultasi properti.`)
              return (
                <div key={agent.id} className="card p-5 text-center hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-primary-100 ring-4 ring-primary-50">
                      {agent.photo
                        ? <img src={agent.photo} alt={agent.name} className="object-cover w-full h-full"/>
                        : <div className="w-full h-full bg-primary-900 flex items-center justify-center text-white font-display text-3xl font-bold">{agent.name.charAt(0)}</div>
                      }
                    </div>
                    {agent.verified && <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">✓</div>}
                  </div>
                  <h3 className="font-display font-bold text-primary-900 text-lg">{agent.name}</h3>
                  {agent.specialization.length > 0 && <p className="text-xs text-gray-500 mt-1">{agent.specialization.slice(0,2).join(' · ')}</p>}
                  {agent.areas.length > 0 && <p className="text-xs text-primary-700 mt-1 font-semibold">📍 {agent.areas.slice(0,2).join(', ')}</p>}
                  <div className="flex justify-center gap-4 mt-4 py-3 border-t border-b border-gray-100">
                    <div><div className="font-display font-bold text-primary-900">{agent.totalListings}</div><div className="text-xs text-gray-400">Listing</div></div>
                    <div><div className="font-display font-bold text-primary-900">{agent.totalDeals}</div><div className="text-xs text-gray-400">Deal</div></div>
                    <div><div className="font-display font-bold text-gold">{'★'.repeat(Math.round(agent.rating))}</div><div className="text-xs text-gray-400">{agent.rating.toFixed(1)}</div></div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link href={`/agents/${agent.id}`} className="flex-1 py-2 text-sm font-semibold border border-primary-200 text-primary-900 rounded-lg hover:bg-primary-50 transition-colors text-center">Profil</Link>
                    <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 text-sm font-semibold bg-[#25D366] text-white rounded-lg hover:bg-[#1da851] transition-colors text-center">💬 WA</a>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400"><div className="text-6xl mb-4">👤</div><p>Data agen dari CRM Mansion akan tampil di sini.</p></div>
        )}
        <div className="mt-16 bg-primary-900 rounded-3xl p-10 text-center">
          <h2 className="text-3xl font-display font-bold text-white mb-3">Ingin Bergabung sebagai Agen?</h2>
          <p className="text-white/70 mb-6 max-w-lg mx-auto">Jadilah bagian dari tim profesional Mansion Realty.</p>
          <a href={`https://wa.me/${wa}?text=Halo%20Mansion%20Realty%2C%20saya%20ingin%20mendaftar%20sebagai%20agen`} target="_blank" rel="noopener noreferrer" className="btn-gold px-8 py-4">Daftar Jadi Agen →</a>
        </div>
      </div>
    </div>
  )
}
AGENTSPAGE
echo "✅ agents/page.tsx"

# ── API routes ────────────────────────────────────────────
cat > $TARGET/src/app/api/sheets/route.ts << 'APISHEET'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
const cache = new Map<string, { data: unknown; expiresAt: number }>()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  if (!action) return NextResponse.json({ success: false, error: 'action required' }, { status: 400 })

  const cached = cache.get(action)
  if (cached && Date.now() < cached.expiresAt) return NextResponse.json({ success: true, data: cached.data, cached: true })

  const GAS_URL = process.env.NEXT_PUBLIC_GAS_API_URL
  if (!GAS_URL || GAS_URL.includes('GANTI')) return NextResponse.json({ success: true, data: [], note: 'GAS URL belum dikonfigurasi' })

  try {
    const url = new URL(GAS_URL)
    url.searchParams.set('action', action)
    url.searchParams.set('secret', process.env.GAS_API_SECRET || '')
    const res = await fetch(url.toString(), { cache: 'no-store' })
    const json = await res.json()
    if (json.success) cache.set(action, { data: json.data, expiresAt: Date.now() + 300_000 })
    return NextResponse.json(json)
  } catch (e) {
    return NextResponse.json({ success: false, error: 'GAS fetch failed' }, { status: 500 })
  }
}
APISHEET

cat > $TARGET/src/app/api/leads/route.ts << 'APILEADS'
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
APILEADS
echo "✅ API routes"

# ── GAS Bridge Script ─────────────────────────────────────
cat > $TARGET/gas/api-bridge.gs << 'GAS'
// ============================================================
// MANSION REALTY — Google Apps Script API Bridge
// Deploy: Extensions > Apps Script > Deploy > New Deployment
//         Type: Web App | Execute as: Me | Access: Anyone
// ============================================================
var SHEET_ID   = 'GANTI_DENGAN_ID_SPREADSHEET_CRM_MANSION'
var API_SECRET = 'GANTI_DENGAN_SECRET_YANG_SAMA_DI_ENV'
var SHEETS = { PROJECTS:'DataProyek', LISTINGS:'DataListing', AGENTS:'DataAgen', NEWS:'DataBerita', LEADS:'DataLead' }

function doGet(e) {
  if (e.parameter.secret !== API_SECRET) return resp({success:false,error:'Unauthorized'})
  try {
    var action = e.parameter.action
    if (action === 'getProjects') return resp({success:true,data:getSheet(SHEETS.PROJECTS)})
    if (action === 'getListings') return resp({success:true,data:getSheet(SHEETS.LISTINGS)})
    if (action === 'getAgents')   return resp({success:true,data:getSheet(SHEETS.AGENTS)})
    if (action === 'getNews')     return resp({success:true,data:getSheet(SHEETS.NEWS)})
    if (action === 'getLeads') {
      var rows = getSheet(SHEETS.LEADS)
      var agentId = e.parameter.agentId
      return resp({success:true,data:agentId?rows.filter(function(r){return r['Agent ID']===agentId}):rows})
    }
    return resp({success:false,error:'Unknown action: '+action})
  } catch(err) { return resp({success:false,error:err.message}) }
}

function doPost(e) {
  var body = JSON.parse(e.postData.contents)
  if (body.secret !== API_SECRET && e.parameter.secret !== API_SECRET) return resp({success:false,error:'Unauthorized'})
  try {
    if (e.parameter.action === 'saveLead' || body.action === 'saveLead') { saveLead(body); return resp({success:true}) }
    return resp({success:false,error:'Unknown POST action'})
  } catch(err) { return resp({success:false,error:err.message}) }
}

function getSheet(name) {
  var ss    = SpreadsheetApp.openById(SHEET_ID)
  var sheet = ss.getSheetByName(name)
  if (!sheet) throw new Error('Sheet "'+name+'" tidak ditemukan')
  var data = sheet.getDataRange().getValues()
  var headers = data[0]; var rows = data.slice(1)
  return rows.filter(function(r){return r.some(function(c){return c!==''})}).map(function(row){
    var obj={}; headers.forEach(function(h,i){obj[h]=row[i]}); return obj
  })
}

function saveLead(lead) {
  var ss    = SpreadsheetApp.openById(SHEET_ID)
  var sheet = ss.getSheetByName(SHEETS.LEADS)
  if (!sheet) throw new Error('Sheet DataLead tidak ditemukan')
  sheet.appendRow(['LEAD-'+Date.now(),lead.listingId||'',lead.listingTitle||'',lead.agentId||'',lead.name||'',lead.phone||'',lead.email||'',lead.message||'',lead.source||'Form',new Date().toISOString(),'New'])
}

function resp(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON) }
GAS
echo "✅ gas/api-bridge.gs"

# ── Dockerfile ────────────────────────────────────────────
cat > $TARGET/Dockerfile << 'DOCKER'
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1 NODE_ENV=production
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=8080
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 8080
CMD ["node", "server.js"]
DOCKER

# ── deploy.sh ─────────────────────────────────────────────
cat > $TARGET/deploy.sh << 'DEPLOY'
#!/bin/bash
set -euo pipefail
PROJECT_ID="GANTI_PROJECT_ID_GCP"
REGION="asia-southeast2"
SERVICE_NAME="mansion-realty-web"
REPO_NAME="mansion-realty"
IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/web"
WA_OFFICE="628123456789"
SITE_URL="https://mansionrealty.co.id"
GAS_API_URL=$(grep NEXT_PUBLIC_GAS_API_URL .env.local | cut -d= -f2)

echo "🚀 Deploy Mansion Realty ke Cloud Run..."
gcloud config set project $PROJECT_ID
gcloud services enable run.googleapis.com artifactregistry.googleapis.com --quiet
gcloud artifacts repositories create $REPO_NAME --repository-format=docker --location=$REGION --quiet 2>/dev/null || true
gcloud auth configure-docker $REGION-docker.pkg.dev --quiet
docker build --build-arg NEXT_PUBLIC_GAS_API_URL="$GAS_API_URL" --build-arg NEXT_PUBLIC_WA_OFFICE="$WA_OFFICE" --build-arg NEXT_PUBLIC_SITE_URL="$SITE_URL" -t $IMAGE:latest .
docker push $IMAGE:latest
gcloud run deploy $SERVICE_NAME --image=$IMAGE:latest --region=$REGION --platform=managed --allow-unauthenticated --port=8080 --memory=1Gi --cpu=1 --max-instances=10 --set-env-vars="NODE_ENV=production,NEXT_PUBLIC_GAS_API_URL=$GAS_API_URL,NEXT_PUBLIC_WA_OFFICE=$WA_OFFICE,NEXT_PUBLIC_SITE_URL=$SITE_URL" --quiet
echo "✅ Deploy selesai!"
gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)'
DEPLOY
chmod +x $TARGET/deploy.sh

echo ""
echo "================================"
echo "✅ SEMUA FILE BERHASIL DIBUAT!"
echo "================================"
echo ""
echo "📁 Lokasi: $TARGET"
echo ""
echo "📋 Langkah selanjutnya:"
echo ""
echo "  1️⃣  Edit .env.local:"
echo "      nano $TARGET/.env.local"
echo "      → Isi NEXT_PUBLIC_GAS_API_URL, NEXT_PUBLIC_WA_OFFICE, dll"
echo ""
echo "  2️⃣  Install dependencies:"
echo "      cd $TARGET && npm install"
echo ""
echo "  3️⃣  Jalankan development:"
echo "      npm run dev"
echo ""
echo "  4️⃣  Setup GAS API Bridge:"
echo "      → Buka gas/api-bridge.gs"
echo "      → Isi SHEET_ID & API_SECRET"
echo "      → Deploy di script.google.com"
echo ""
echo "  5️⃣  Deploy ke Cloud Run:"
echo "      → Edit PROJECT_ID di deploy.sh"
echo "      → ./deploy.sh"
echo ""
