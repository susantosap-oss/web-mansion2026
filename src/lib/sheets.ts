import { Project, Listing, Agent, News, SheetRow, AgentScoreWeights, DEFAULT_SCORE_WEIGHTS } from '@/types'
import { getCached, setCached } from '@/lib/gasCache'

const GAS_URL    = process.env.NEXT_PUBLIC_GAS_API_URL!
const GAS_SECRET = process.env.GAS_API_SECRET || ''

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

  const res = await fetch(url.toString(), { next: { revalidate: ttl, tags: [`gas:${action}`] } })
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
  const utama   = str(row['Foto_Utama_URL'])
  const foto2   = str(row['Foto_2_URL'])
  const foto3   = str(row['Foto_3_URL'])
  const gallery = str(row['Foto_Gallery'])

  const all: string[] = []
  if (utama && utama.startsWith('http')) all.push(utama)
  if (foto2 && foto2.startsWith('http')) all.push(foto2)
  if (foto3 && foto3.startsWith('http')) all.push(foto3)

  if (gallery && gallery.startsWith('http')) {
    gallery.split(',').map((s: string) => s.trim())
      .filter((s: string) => s.startsWith('http'))
      .forEach((s: string) => { if (!all.includes(s)) all.push(s) })
  }

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
  const transaksi = (tipe.toLowerCase().includes('jual') || tipe.toLowerCase().includes('sale'))
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
    agentId:       (() => {
      const raw = str(row['Agen_ID'])
      return raw.startsWith('[') ? '' : raw
    })(),
    agentName:     (() => {
      // Prioritas: _agentName dari join, lalu Agen_Nama dari kolom
      const fromJoin = str(row['_agentName'])
      if (fromJoin) return fromJoin
      const fromCol = str(row['Agen_Nama'])
      if (fromCol && !fromCol.startsWith('[') && !fromCol.includes('cloudinary') && !fromCol.includes('crm-broker')) {
        return fromCol
      }
      return ''
    })(),
    agentPhone:    str(row['_agentPhone'] || ''), // diisi dari join dengan AGENTS
    agentPhoto:    str(row['_agentPhoto'] || ''),
    coOwners:      (row['_coOwners'] as unknown as { id: string; name: string; phone: string; photo: string }[]) || [],
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
  const nama = str(row['Nama_Proyek'])
  // SSoT koordinator: kolom Koordinator_ID (col U), fallback Created_By_ID
  const koordId = str(row['Koordinator_ID']) || str(row['Created_By_ID'])
  return {
    id,
    slug:        makeSlug(nama, id),
    name:        nama,
    developer:   str(row['Nama_Developer']),
    location:    '',
    city:        '',
    province:    '',
    priceMin:    num(row['Harga_Mulai']),
    priceMax:    num(row['Harga_Mulai']),
    type:        (str(row['Tipe_Properti']) as Project['type']) || 'Perumahan',
    status:      (str(row['Status']) as Project['status']) || 'Aktif',
    description: str(row['Deskripsi']),
    coverImage:  str(row['Foto_1_URL']),
    images:      [str(row['Foto_1_URL']), str(row['Foto_2_URL']), str(row['Foto_3_URL']), str(row['Foto_4_URL'])].filter(s => s.startsWith('http')),
    specs:       {},
    facilities:  [],
    agentId:     koordId,
    createdAt:   str(row['Created_At'] || row['Tanggal_Input']),
    updatedAt:   str(row['Updated_At']),
  }
}

function agentCity(kantorName: string): string {
  return kantorName.toLowerCase().includes('malang') ? 'Malang' : 'Surabaya'
}

function mapAgent(row: SheetRow): Agent {
  const kantor = str(row['Nama_Kantor'] || '')
  return {
    id:             str(row['ID']),
    name:           str(row['Nama']),
    photo:          str(row['Foto_URL']),
    phone:          str(row['No_WA']),
    email:          str(row['Email']),
    whatsapp:       str(row['No_WA_Business'] || row['No_WA']),
    bio:            kantor,
    specialization: [],
    areas:          [],
    totalListings:  num(row['Listing_Count'] || row['Total_Listing'] || row['listing_count'] || 0),
    totalDeals:     num(row['Deal_Count'] || row['Total_Deal'] || row['deal_count'] || 0),
    rating:         5,
    verified:       str(row['Status']).toLowerCase() === 'active' || str(row['Status']).toLowerCase() === 'aktif',
    joinDate:       str(row['Join_Date'] || row['Created_At']),
    instagram:      undefined,
    linkedin:       undefined,
    // Sertifikasi & identitas profesional (Prioritas 1)
    nomerLsp:       str(row['Nomer_LSP'] || ''),
    sertifikasi:    str(row['Sertifikasi'] || ''),
    nomerCra:       str(row['Nomer_CRA'] || ''),
    // Aktivitas CRM
    hitCount:       num(row['Hit_Count'] || 0),
    shareCount:     num(row['Share_Count'] || 0),
    leadsCount:     num(row['Leads_Count'] || 0),
    loginCount:     num(row['Login_Count'] || 0),
    jadwalCount:    num(row['Jadwal_Count'] || 0),
    aktivitasCount: num(row['Aktivitas_Count'] || 0),
    role:           str(row['Role'] || '').toLowerCase(),
    city:           agentCity(kantor),
  }
}

// ── Score Weights ─────────────────────────────────────────
// (interface & defaults ada di @/types)

/**
 * Hitung skor peringkat agen. Weights dapat dikustomisasi dari Dashboard.
 * P1: Nomer LSP / Sertifikasi / CRA        → bobot lsp (flat)
 * P2: Jumlah Listing                       → bobot listing × jumlah
 * P3: Hit & Share di CRM                  → bobot hitShare × jumlah
 * P4: Bonus Role Koord/BM/Principal       → flat sesuai role
 * P5: Leads terbanyak                     → bobot leads × jumlah
 * P6: Keaktifan login                     → bobot login × jumlah
 * P7: Pengisian Jadwal                    → bobot jadwal × jumlah
 * P8: Aktivitas Harian                    → bobot aktivitas × jumlah
 */
export function computeAgentScore(agent: Agent, weights: AgentScoreWeights = DEFAULT_SCORE_WEIGHTS): number {
  const hasLsp   = !!(agent.nomerLsp || agent.sertifikasi || agent.nomerCra)
  const role     = agent.role || ''
  const isKoord  = role === 'koordinator' || role === 'coordinator' || role === 'koord'
  const isBM     = role === 'business_manager' || role === 'bm' || role === 'businessmanager' || role === 'business manager' || role === 'manager'
  const isPrincipal = role === 'principal'
  return (
    (hasLsp ? weights.lsp : 0)
    + agent.totalListings * weights.listing
    + ((agent.hitCount ?? 0) + (agent.shareCount ?? 0)) * weights.hitShare
    + (isKoord ? weights.koord : isBM ? weights.bm : isPrincipal ? weights.principal : 0)
    + (agent.leadsCount ?? 0) * weights.leads
    + (agent.loginCount ?? 0) * weights.login
    + (agent.jadwalCount ?? 0) * weights.jadwal
    + (agent.aktivitasCount ?? 0) * (weights.aktivitas ?? 10)
  )
}


export async function getListings(filter?: {
  type?: 'Sale' | 'Rent'
  city?: string
  propertyType?: string
  featured?: boolean
}): Promise<Listing[]> {
  try {
    // Fetch listings, agents, dan listing_agents sekaligus
    const [rows, agents, listingAgentRows] = await Promise.all([
      fetchFromGAS<SheetRow[]>('getListings', 60),
      fetchFromGAS<SheetRow[]>('getAgents', 600),
      fetchFromGAS<SheetRow[]>('getListingAgents', 60).catch(() => [] as SheetRow[]),
    ])

    // Buat map agen untuk lookup cepat
    const agentMap = new Map<string, SheetRow>()
    agents.forEach(a => agentMap.set(str(a['ID']), a))

    // Buat map co-owners per listing_id: listing_id → [{id, name, phone, photo}]
    const coOwnerMap = new Map<string, { id: string; name: string; phone: string; photo: string }[]>()
    listingAgentRows
      .filter(r => str(r['Role']) === 'co_own')
      .forEach(r => {
        const listingId = str(r['Listing_ID'])
        const agenId    = str(r['Agen_ID'])
        const agent     = agentMap.get(agenId)
        const entry = {
          id:    agenId,
          name:  agent ? str(agent['Nama'] || '') : str(r['Agen_Nama'] || ''),
          phone: agent ? str(agent['No_WA_Business'] || agent['No_WA'] || '') : '',
          photo: agent ? str(agent['Foto_URL'] || '') : '',
        }
        if (!coOwnerMap.has(listingId)) coOwnerMap.set(listingId, [])
        coOwnerMap.get(listingId)!.push(entry)
      })

    let listings = rows
      .filter(r => {
        const v = r['Tampilkan_di_Web']
        // Tampilkan kecuali eksplisit FALSE — row tanpa nilai = tetap tampil
        return v !== false && String(v).toUpperCase() !== 'FALSE'
      })
      .map(row => {
        // Join data owner (agen utama)
        const agent = agentMap.get(str(row['Agen_ID']))
        if (agent) {
          row['_agentPhone'] = str(agent['WhatsApp'] || agent['WA'] || agent['No_WA'] || agent['Telepon'] || '')
          row['_agentPhoto'] = str(agent['Foto_URL'] || agent['Foto'] || agent['Photo'] || '')
          row['_agentName']  = str(agent['Nama'] || '')
        }
        // Join co-owners
        const id = str(row['ID'])
        ;(row as Record<string, unknown>)['_coOwners'] = coOwnerMap.get(id) || []
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
    const [rows, listingRows] = await Promise.all([
      fetchFromGAS<SheetRow[]>('getAgents', 600),
      fetchFromGAS<SheetRow[]>('getListings', 60).catch(() => [] as SheetRow[]),
    ])

    // Strip kolom sensitif — tidak boleh expose ke client
    rows.forEach((row: any) => {
      delete row['Password_Hash']
      delete row['Password']
      delete row['Telegram_ID']
    })

    // Hitung listing & deal dari LISTINGS sheet (SSoT dari GSheet)
    const listingCountMap = new Map<string, number>()
    const dealCountMap    = new Map<string, number>()
    listingRows.forEach(l => {
      const agentId = str(l['Agen_ID'])
      if (!agentId || agentId.startsWith('[')) return
      const tampil = l['Tampilkan_di_Web']
      if (tampil === false || String(tampil).toUpperCase() === 'FALSE') return
      listingCountMap.set(agentId, (listingCountMap.get(agentId) || 0) + 1)
      const status = str(l['Status_Listing']).toLowerCase()
      if (status === 'terjual' || status === 'disewa' || status === 'sold' || status === 'deal') {
        dealCountMap.set(agentId, (dealCountMap.get(agentId) || 0) + 1)
      }
    })

    return rows
      .filter(row => str(row['Tampilkan_di_Web']).toUpperCase() !== 'FALSE')
      .map(row => {
        const agent = mapAgent(row)
        // Override dengan hitungan real dari LISTINGS (SSoT)
        if (listingCountMap.has(agent.id)) agent.totalListings = listingCountMap.get(agent.id)!
        if (dealCountMap.has(agent.id))    agent.totalDeals    = dealCountMap.get(agent.id)!
        return agent
      })
      .filter(a => a.role !== 'admin' && a.role !== 'superadmin' && a.role !== 'kantor')
  } catch (e) {
    console.error('[getAgents]', e)
    return []
  }
}

function nameToSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').trim()
}

export async function getAgentById(id: string): Promise<Agent | null> {
  const agents = await getAgents()
  // Coba match UUID dulu
  const byId = agents.find(a => a.id === id)
  if (byId) return byId
  // Fallback: match by name slug (untuk URL dari share WA)
  return agents.find(a => nameToSlug(a.name) === id) || null
}

function mapNews(row: SheetRow): News {
  const judul = str(row['Judul'] || '')
  const ts    = str(row['Timestamp'] || row['Created_At'] || '')
  // Buat slug dari judul + timestamp
  const slug  = makeSlug(judul, ts.replace(/\D/g,'').slice(0,8) || String(Date.now()))
  const validCategories = ['Berita Properti','Tips & Trik','Regulasi','KPR & Pembiayaan','Investasi'] as const
  const rawCat = str(row['Kategori'] || 'Berita Properti')
  const category = (validCategories.includes(rawCat as typeof validCategories[number])
    ? rawCat : 'Berita Properti') as News['category']
  return {
    id:          ts,
    slug,
    title:       judul,
    summary:     str(row['Ringkasan'] || ''),
    content:     str(row['Konten'] || ''),
    category,
    coverImage:  str(row['Foto URL'] || row['Foto_URL'] || row['foto_url'] || ''),
    author:      str(row['Penulis'] || 'Mansion Realty'),
    publishedAt: ts,
    tags:        str(row['Tags'] || '').split(',').map((s: string) => s.trim()).filter(Boolean),
    viewCount:   num(row['Views_Count'] || 0),
  }
}

export async function getNews(limit?: number): Promise<News[]> {
  try {
    const rows = await fetchFromGAS<SheetRow[]>('getNews', 600)
    const news = rows
      .map(mapNews)
      .sort((a, b) => new Date(b.publishedAt || b.id).getTime() - new Date(a.publishedAt || a.id).getTime())
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
export type { AgentScoreWeights }
export { DEFAULT_SCORE_WEIGHTS }
