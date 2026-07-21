/**
 * Search API Client
 * ============================================
 * Tipe dan fungsi untuk memanggil /api/search dari client component.
 * Proxy internal → CRM Public API (API key disimpan server-side).
 */

import type { Listing } from '@/types'
import { formatPrice } from '@/lib/sheets'

// ── Types ──────────────────────────────────────────────────

export interface SearchParams {
  keyword?:           string
  property_type?:     string
  transaction_type?:  string
  city?:              string
  area?:              string
  price_min?:         number | string
  price_max?:         number | string
  bedroom_min?:       number | string
  bathroom_min?:      number | string
  land_area_min?:     number | string
  land_area_max?:     number | string
  building_area_min?: number | string
  building_area_max?: number | string
  status?:            string
  featured?:          boolean
  sort?:              'terbaru' | 'terlama' | 'harga_termurah' | 'harga_termahal' | 'terpopuler'
  page?:              number
  limit?:             number
}

export interface SearchResult {
  total:       number
  page:        number
  limit:       number
  total_pages: number
  results:     CrmListing[]
}

export interface SearchOptions {
  property_types:    string[]
  transaction_types: string[]
  cities:            string[]
  areas:             string[]
  statuses:          string[]
  harga_min:         number
  harga_max:         number
}

/** Shape dari CRM search result (public API response) */
export interface CrmListing {
  id:               string
  kode:             string
  judul:            string
  deskripsi:        string
  property_type:    string
  transaction_type: string
  status:           string
  harga:            number
  harga_format:     string
  alamat:           string
  kecamatan:        string
  kota:             string
  provinsi:         string
  luas_tanah:       number
  luas_bangunan:    number
  kamar_tidur:      number
  kamar_mandi:      number
  garasi:           number
  lantai:           number
  sertifikat:       string
  kondisi:          string
  fasilitas:        string[]
  foto_utama:       string
  foto_gallery:     string[]
  featured:         boolean
  koordinat:        { lat: string; lng: string }
  maps_url:         string
  views:            number
  project_id:       string | null
  created_at:       string
  updated_at:       string
}

// ── Mapper: CRM result → Listing (for ListingCard compatibility) ──

function makeSlug(text: string, id: string): string {
  return (text || 'properti').toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() + '-' + id.slice(-6)
}

const PROP_TYPE_MAP: Record<string, Listing['propertyType']> = {
  rumah:     'Rumah',    house:      'Rumah',
  apartemen: 'Apartemen', apartment: 'Apartemen',
  ruko:      'Ruko',     shophouse:  'Ruko',
  kavling:   'Kavling',  tanah:      'Kavling',   land: 'Kavling',
  gedung:    'Gedung',   building:   'Gedung',
  gudang:    'Gudang',   warehouse:  'Gudang',
}

export function mapCrmToListing(r: CrmListing): Listing {
  const isRent = r.transaction_type?.toLowerCase().includes('sewa')
  const propType = PROP_TYPE_MAP[r.property_type?.toLowerCase()] || 'Rumah'

  return {
    id:           r.id,
    slug:         makeSlug(r.judul, r.id),
    title:        r.judul  || 'Properti',
    type:         isRent ? 'Rent' : 'Sale',
    propertyType: propType,
    price:        r.harga  || 0,
    priceUnit:    isRent ? 'Sewa/Bulan' : 'Jual',
    location:     r.kecamatan || '',
    address:      r.alamat    || '',
    city:         r.kota      || '',
    province:     r.provinsi  || '',
    luasTanah:    r.luas_tanah    || 0,
    luasBangunan: r.luas_bangunan || 0,
    kamarTidur:   r.kamar_tidur   || 0,
    kamarMandi:   r.kamar_mandi   || 0,
    carport:      r.garasi        || 0,
    lantai:       r.lantai        || 1,
    kondisi:      (r.kondisi as Listing['kondisi']) || 'Bagus',
    sertifikat:   (r.sertifikat as Listing['sertifikat']) || 'SHM',
    description:  r.deskripsi  || '',
    coverImage:   r.foto_utama || '',
    images:       r.foto_utama
                    ? [r.foto_utama, ...(r.foto_gallery || [])]
                    : (r.foto_gallery || []),
    agentId:      '',
    agentName:    '',
    agentPhone:   process.env.NEXT_PUBLIC_WA_OFFICE || '',
    agentPhoto:   '',
    coOwners:     [],
    viewCount:    r.views || 0,
    leadCount:    0,
    status:       (r.status === 'Aktif' ? 'Aktif' : 'Off Market') as Listing['status'],
    featured:     r.featured || false,
    createdAt:    r.created_at || '',
    updatedAt:    r.updated_at || '',
  }
}

// ── API Calls ──────────────────────────────────────────────

export async function searchListings(params: SearchParams): Promise<SearchResult> {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== 0) qs.set(k, String(v))
  })

  const res = await fetch(`/api/search?${qs.toString()}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Search error ${res.status}`)
  const json = await res.json()
  if (!json.success) throw new Error(json.message || 'Search gagal')
  return json as SearchResult
}

export async function getSearchOptions(): Promise<SearchOptions> {
  const res = await fetch('/api/search/options', { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`Options error ${res.status}`)
  const json = await res.json()
  return json.data as SearchOptions
}

export interface AiSearchResponse extends SearchResult {
  ai: {
    raw_query:        string
    extracted_filter: Partial<SearchParams>
    ai_raw:           Record<string, unknown> | null
    fallback:         boolean
  }
}

export async function aiSearchListings(
  query: string,
  opts: { page?: number; limit?: number; sort?: string } = {}
): Promise<AiSearchResponse> {
  const res = await fetch('/api/ai-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, ...opts }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`AI Search error ${res.status}`)
  const json = await res.json()
  if (!json.success) throw new Error(json.message || 'AI Search gagal')
  return json as AiSearchResponse
}

// ── Formatting Helpers ─────────────────────────────────────

export function formatPriceShort(price: number): string {
  if (!price || price === 0) return 'Nego'
  if (price >= 1_000_000_000) {
    const m = price / 1_000_000_000
    return `Rp ${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)} M`
  }
  if (price >= 1_000_000) {
    const j = price / 1_000_000
    return `Rp ${j % 1 === 0 ? j.toFixed(0) : j.toFixed(1)} Jt`
  }
  return formatPrice(price)
}

export function buildSearchUrl(params: Partial<SearchParams>): string {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== 0 && v !== false) qs.set(k, String(v))
  })
  const q = qs.toString()
  return q ? `/cari?${q}` : '/cari'
}
