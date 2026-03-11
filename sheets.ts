import { Project, Listing, Agent, News, SheetRow } from '@/types'

const GAS_URL    = process.env.NEXT_PUBLIC_GAS_API_URL!
const GAS_SECRET = process.env.GAS_API_SECRET || 'mansion2026'

// ── In-Memory Cache ───────────────────────────────────────
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

// ── Fetch dari GAS ────────────────────────────────────────
async function fetchFromGAS<T>(action: string, ttl = 300): Promise<T> {
  const cacheKey = `gas:${action}`
  const cached   = getCached<T>(cacheKey)
  if (cached) return cached

  if (!GAS_URL || GAS_URL.includes('GANTI')) {
    console.warn('[GAS] URL belum dikonfigurasi di .env.local')
    return [] as unknown as T
  }

  const url = new URL(GAS_URL)
  url.searchParams.set('action', action)
  url.searchParams.set('secret', GAS_SECRET)

  const res = await fetch(url.toString(), { next: { revalidate: ttl } })
  if (!res.ok) throw new Error(`GAS error: ${res.status}`)

  const json = await res.json()
  if (!json.success) throw new Error(json.error || 'GAS returned error')

  setCached(cacheKey, json.data as T, ttl)
  return json.data as T
}

// ── Helper ────────────────────────────────────────────────
function str(v: unknown): string  { return v !== undefined && v !== null ? String(v) : '' }
function num(v: unknown): number  { return Number(v) || 0 }
function bool(v: unknown): boolean { return v === true || v === 'TRUE' || v === 'true' || v === 1 || v === '1' }

function parseImages(row: SheetRow): string[] {
  const gallery = str(row['Foto_Gallery'])
  const foto2   = str(row['Foto_2_URL'])
  const foto3   = str(row['Foto_3_URL'])
  const utama   = str(row['Foto_Utama_URL'])

  const all: string[] = []
  if (utama)   all.push(utama)
  if (foto2)   all.push(foto2)
  if (foto3)   all.push(foto3)
  if (gallery) gallery.split(',').map(s => s.trim()).filter(Boolean).forEach(s => { if (!all.includes(s)) all.push(s) })

  return all
}

function makeSlug(text: string, id: string): string {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() + '-' + id.slice(-6)
}

// ── Mapper: LISTING → Listing ─────────────────────────────
// Kolom asli CRM Mansion:
// ID | Tanggal_Input | Kode_Listing | Tipe_Properti | Status_Transaksi |
// Status_Listing | Judul | Deskripsi | Caption_Sosmed | Harga | Harga_Format |
// Alamat | Kecamatan | Kota | Provinsi | Luas_Tanah | Luas_Bangunan |
// Kamar_Tidur | Kamar_Mandi | Lantai | Garasi | Sertifikat | Kondisi |
// Fasilitas | Foto_Utama_URL | Foto_Gallery | Cloudinary_IDs |
// Agen_ID | Agen_Nama | Koordinat_Lat | Koordinat_Lng | Maps_URL |
// Tampilkan_di_Web | Featured | Views_Count | Created_At | Updated_At |
// Notes | Foto_2_URL | Foto_3_URL | Team_ID
function mapListing(row: SheetRow): Listing {
  const id    = str(row['ID'])
  const judul = str(row['Judul'])
  const tipe  = str(row['Status_Transaksi']) // Sale / Rent

  // Normalize tipe transaksi
  const transaksi = tipe.toLowerCase().includes('jual') || tipe.toLowerCase() === 'sale'
    ? 'Sale' : 'Rent'

  // Normalize tipe properti
  const tipeProperti = str(row['Tipe_Properti'])
  const propMap: Record<string, Listing['propertyType']> = {
    'rumah': 'Rumah', 'house': 'Rumah',
    'apartemen': 'Apartemen', 'apartment': 'Apartemen',
    'ruko': 'Ruko', 'shophouse': 'Ruko',
    'kavling': 'Kavling', 'tanah': 'Kavling', 'land': 'Kavling',
    'gedung': 'Gedung', 'building': 'Gedung',
    'gudang': 'Gudang', 'warehouse': 'Gudang',
  }
  const propType = propMap[tipeProperti.toLowerCase()] || 'Rumah'

  return {
    id,
    slug:          makeSlug(judul, id),
    title:         judul,
    type:          transaksi,
    propertyType:  propType,
    price:         num(row['Harga']),
    priceUnit:     transaksi === 'Sale' ? 'Jual' : 'Sewa/Bulan',
    location:      str(row['Kecamatan']),
    address:       str(row['Alamat']),
    city:          str(row['Kota']),
    province:      str(row['Provinsi']),
    luasTanah:     num(row['Luas_Tanah']),
    luasBangunan:  num(row['Luas_Bangunan']),
    kamarTidur:    num(row['Kamar_Tidur']),
    kamarMandi:    num(row['Kamar_Mandi']),
    carport:       num(row['Garasi']),
    lantai:        num(row['Lantai']) || 1,
    kondisi:       (str(row['Kondisi']) as Listing['kondisi']) || 'Bagus',
    sertifikat:    (str(row['Sertifikat']) as Listing['sertifikat']) || 'SHM',
    description:   str(row['Deskripsi']),
    coverImage:    str(row['Foto_Utama_URL']),
    images:        parseImages(row),
    agentId:       str(row['Agen_ID']),
    agentName:     str(row['Agen_Nama']),
    agentPhone:    str(row['_agentPhone'] || ''), // diisi dari join dengan AGENTS
    agentPhoto:    str(row['_agentPhoto'] || ''),
    viewCount:     num(row['Views_Count']),
    leadCount:     0,
    status:        str(row['Status_Listing']) === 'Aktif' || str(row['Status_Listing']) === 'Active'
                     ? 'Aktif' : (str(row['Status_Listing']) as Listing['status']) || 'Aktif',
    featured:      bool(row['Featured']),
    createdAt:     str(row['Created_At'] || row['Tanggal_Input']),
    updatedAt:     str(row['Updated_At']),
  }
}

// ── Mapper: PROJECTS → Project ────────────────────────────
function mapProject(row: SheetRow): Project {
  const id   = str(row['ID'])
  const nama = str(row['Nama_Proyek'] || row['Judul'] || row['NAMA'] || row['Name'] || '')

  return {
    id,
    slug:        makeSlug(nama, id),
    name:        nama,
    developer:   str(row['Developer'] || row['DEVELOPER'] || ''),
    location:    str(row['Kecamatan'] || row['Lokasi'] || row['LOKASI'] || ''),
    city:        str(row['Kota'] || row['KOTA'] || ''),
    province:    str(row['Provinsi'] || row['PROVINSI'] || ''),
    priceMin:    num(row['Harga_Min'] || row['Harga'] || 0),
    priceMax:    num(row['Harga_Max'] || row['Harga'] || 0),
    type:        (str(row['Tipe_Properti'] || row['Tipe'] || 'Perumahan') as Project['type']),
    status:      (str(row['Status'] || row['Status_Listing'] || 'Aktif') as Project['status']),
    description: str(row['Deskripsi'] || row['DESKRIPSI'] || ''),
    coverImage:  str(row['Foto_Utama_URL'] || row['Cover_Image'] || ''),
    images:      parseImages(row),
    specs: {
      luasTanah:    row['Luas_Tanah']    ? str(row['Luas_Tanah'])    : undefined,
      luasBangunan: row['Luas_Bangunan'] ? str(row['Luas_Bangunan']) : undefined,
      kamarTidur:   row['Kamar_Tidur']   ? num(row['Kamar_Tidur'])   : undefined,
      kamarMandi:   row['Kamar_Mandi']   ? num(row['Kamar_Mandi'])   : undefined,
      carport:      row['Garasi']        ? num(row['Garasi'])        : undefined,
    },
    facilities:  str(row['Fasilitas'] || '').split(',').map(s => s.trim()).filter(Boolean),
    agentId:     str(row['Agen_ID'] || ''),
    createdAt:   str(row['Created_At'] || row['Tanggal_Input'] || ''),
    updatedAt:   str(row['Updated_At'] || ''),
  }
}

// ── Mapper: AGENTS → Agent ────────────────────────────────
function mapAgent(row: SheetRow): Agent {
  return {
    id:             str(row['ID']),
    name:           str(row['Nama'] || row['NAMA'] || row['Name'] || ''),
    photo:          str(row['Foto_URL'] || row['Foto'] || row['Photo'] || row['Avatar'] || ''),
    phone:          str(row['Telepon'] || row['Phone'] || row['No_HP'] || ''),
    email:          str(row['Email'] || row['EMAIL'] || ''),
    whatsapp:       str(row['WhatsApp'] || row['WA'] || row['No_WA'] || row['Telepon'] || ''),
    bio:            str(row['Bio'] || row['Deskripsi'] || row['About'] || ''),
    specialization: str(row['Spesialisasi'] || row['Specialization'] || '').split(',').map(s => s.trim()).filter(Boolean),
    areas:          str(row['Area'] || row['Wilayah'] || row['Kota'] || '').split(',').map(s => s.trim()).filter(Boolean),
    totalListings:  num(row['Total_Listing'] || row['Jumlah_Listing'] || 0),
    totalDeals:     num(row['Total_Deal'] || row['Jumlah_Deal'] || 0),
    rating:         num(row['Rating'] || 5),
    verified:       bool(row['Verified'] || row['Terverifikasi'] || false),
    joinDate:       str(row['Join_Date'] || row['Tanggal_Bergabung'] || row['Created_At'] || ''),
    instagram:      row['Instagram'] ? str(row['Instagram']) : undefined,
    linkedin:       row['LinkedIn']  ? str(row['LinkedIn'])  : undefined,
  }
}

// ── Mapper: NEWS → News ───────────────────────────────────
function mapNews(row: SheetRow): News {
  const id    = str(row['ID'])
  const judul = str(row['Judul'] || row['Title'] || '')
  return {
    id,
    slug:        makeSlug(judul, id),
    title:       judul,
    summary:     str(row['Ringkasan'] || row['Summary'] || row['Excerpt'] || ''),
    content:     str(row['Konten'] || row['Content'] || row['Body'] || ''),
    coverImage:  str(row['Foto_URL'] || row['Cover_Image'] || row['Foto_Utama_URL'] || ''),
    category:    (str(row['Kategori'] || row['Category'] || 'Berita Properti') as News['category']),
    author:      str(row['Penulis'] || row['Author'] || 'Mansion Realty'),
    publishedAt: str(row['Tanggal'] || row['Published_At'] || row['Created_At'] || ''),
    tags:        str(row['Tags'] || '').split(',').map(s => s.trim()).filter(Boolean),
    viewCount:   num(row['Views'] || row['Views_Count'] || 0),
  }
}

// ── Public API ────────────────────────────────────────────

export async function getListings(filter?: {
  type?: 'Sale' | 'Rent'
  city?: string
  propertyType?: string
  featured?: boolean
}): Promise<Listing[]> {
  try {
    // Fetch listings dan agents sekaligus untuk join data agen
    const [rows, agents] = await Promise.all([
      fetchFromGAS<SheetRow[]>('getListings', 300),
      fetchFromGAS<SheetRow[]>('getAgents', 600),
    ])

    // Buat map agen untuk lookup cepat
    const agentMap = new Map<string, SheetRow>()
    agents.forEach(a => agentMap.set(str(a['ID']), a))

    let listings = rows
      .filter(r => bool(r['Tampilkan_di_Web']) || r['Tampilkan_di_Web'] === '' || r['Tampilkan_di_Web'] === undefined)
      .map(row => {
        // Join data agen
        const agent = agentMap.get(str(row['Agen_ID']))
        if (agent) {
          row['_agentPhone'] = str(agent['WhatsApp'] || agent['WA'] || agent['No_WA'] || agent['Telepon'] || '')
          row['_agentPhoto'] = str(agent['Foto_URL'] || agent['Foto'] || agent['Photo'] || '')
        }
        return mapListing(row)
      })

    // Apply filters
    if (filter?.type)         listings = listings.filter(l => l.type === filter.type)
    if (filter?.city)         listings = listings.filter(l => l.city.toLowerCase().includes(filter.city!.toLowerCase()))
    if (filter?.propertyType) listings = listings.filter(l => l.propertyType === filter.propertyType)
    if (filter?.featured)     listings = listings.filter(l => l.featured)

    return listings
  } catch (e) {
    console.error('[getListings]', e)
    return []
  }
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  const listings = await getListings()
  return listings.find(l => l.slug === slug) || null
}

export async function getListingById(id: string): Promise<Listing | null> {
  const listings = await getListings()
  return listings.find(l => l.id === id) || null
}

export async function getProjects(): Promise<Project[]> {
  try {
    const rows = await fetchFromGAS<SheetRow[]>('getProjects', 300)
    return rows.map(mapProject)
  } catch (e) {
    console.error('[getProjects]', e)
    return []
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const projects = await getProjects()
  return projects.find(p => p.slug === slug) || null
}

export async function getAgents(): Promise<Agent[]> {
  try {
    const rows = await fetchFromGAS<SheetRow[]>('getAgents', 600)
    return rows.map(mapAgent)
  } catch (e) {
    console.error('[getAgents]', e)
    return []
  }
}

export async function getAgentById(id: string): Promise<Agent | null> {
  const agents = await getAgents()
  return agents.find(a => a.id === id) || null
}

export async function getNews(limit?: number): Promise<News[]> {
  try {
    const rows = await fetchFromGAS<SheetRow[]>('getNews', 600)
    const news = rows
      .map(mapNews)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    return limit ? news.slice(0, limit) : news
  } catch (e) {
    console.error('[getNews]', e)
    return []
  }
}

// ── Utilities ─────────────────────────────────────────────

export function formatPrice(price: number): string {
  if (!price || price === 0) return 'Harga Nego'
  if (price >= 1_000_000_000) {
    const m = price / 1_000_000_000
    return `Rp ${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1).replace('.0','')} M`
  }
  if (price >= 1_000_000) {
    const j = price / 1_000_000
    return `Rp ${j % 1 === 0 ? j.toFixed(0) : j.toFixed(1).replace('.0','')} Jt`
  }
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
}

export function buildWALink(phone: string, message: string): string {
  if (!phone) return `https://wa.me/${process.env.NEXT_PUBLIC_WA_OFFICE || '6281234567890'}?text=${encodeURIComponent(message)}`
  const clean      = phone.replace(/\D/g, '')
  const normalized = clean.startsWith('0') ? '62' + clean.slice(1) : clean.startsWith('62') ? clean : '62' + clean
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}

export type { Listing, Project, Agent, News }
