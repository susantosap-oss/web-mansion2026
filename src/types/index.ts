export interface Project {
  id: string; slug: string; name: string; developer: string
  location: string; city: string; province: string
  priceMin: number; priceMax: number
  type: 'Perumahan' | 'Apartemen' | 'Ruko' | 'Kavling' | 'Gudang' | 'Komersial'
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
  coOwners: { id: string; name: string; phone: string; photo: string }[]
  viewCount: number; leadCount: number
  status: 'Aktif' | 'Terjual' | 'Disewa' | 'Off Market'
  featured: boolean; createdAt: string; updatedAt: string
}

export interface Agent {
  id: string; name: string; photo: string; phone: string
  email: string; whatsapp: string; bio: string
  specialization: string[]; areas: string[]
  totalListings: number; totalDeals: number; konversiRate: number; rating: number
  verified: boolean; joinDate: string; instagram?: string; linkedin?: string
  // Sertifikasi & identitas profesional (Prioritas 1)
  nomerLsp?: string; sertifikasi?: string; nomerCra?: string
  // Aktivitas CRM (Prioritas 3,4,5,6,7,8)
  hitCount?: number; shareCount?: number; leadsCount?: number
  loginCount?: number; jadwalCount?: number; aktivitasCount?: number
  role?: string
  city?: string
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

export interface CleanURL {
  id: string
  pathPrefix: 'listings' | 'projects' | 'agents' | 'news'
  slug: string
  label: string
  filterType?: 'Sale' | 'Rent'
  propertyType?: string
  city?: string
  title: string
  description: string
  h1: string
  active: boolean
}

export interface AgentScoreWeights {
  lsp:          number
  listing:      number
  hitShare:     number
  koord:        number
  bm:           number
  principal:    number
  leads:        number
  login:        number
  jadwal:       number
  aktivitas:    number   // P8: poin per aktivitas harian yang diinput agen
  koordProject: number   // P9: bonus koordinator di halaman proyek miliknya sendiri
}

export const DEFAULT_SCORE_WEIGHTS: AgentScoreWeights = {
  lsp:          1_000_000,
  listing:      500,
  hitShare:     50,
  koord:        80_000,
  bm:           120_000,
  principal:    150_000,
  leads:        30,
  login:        5,
  jadwal:       2,
  aktivitas:    10,
  koordProject: 999_999,  // default: koordinator proyek selalu muncul pertama
}

export interface APIResponse<T> {
  success: boolean; data?: T; error?: string; timestamp: string; cached?: boolean
}
