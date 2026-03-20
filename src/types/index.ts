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
  nomerLsp?: string; role?: string
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
