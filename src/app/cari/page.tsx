import type { Metadata } from 'next'
import { Suspense } from 'react'
import SearchEngine from '@/components/property/SearchEngine'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import { type SearchOptions } from '@/lib/searchApi'

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mansionpro.id'

export const metadata: Metadata = {
  title: 'Cari Properti — Rumah, Ruko, Tanah di Surabaya | Mansion Realty',
  description: 'Temukan properti impian Anda di Surabaya dan sekitarnya. Filter berdasarkan tipe, harga, lokasi, kamar tidur, dan luas. Ribuan listing dari agen terpercaya Mansion Realty.',
  alternates: { canonical: `${BASE}/cari` },
  openGraph: {
    title: 'Cari Properti — Mansion Realty',
    description: 'Search engine properti terlengkap. Filter harga, lokasi, tipe, dan spesifikasi.',
    url: `${BASE}/cari`,
    type: 'website',
  },
}

// Fetch filter options server-side (cached 5 menit)
async function getInitialOptions(): Promise<SearchOptions> {
  const CRM_URL = process.env.CRM_PUBLIC_URL || 'https://crm.mansionpro.id'
  const API_KEY = process.env.CRM_PUBLIC_API_KEY || ''

  try {
    const res = await fetch(`${CRM_URL}/public/api/v1/search/options`, {
      headers: { 'x-api-key': API_KEY },
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error(`${res.status}`)
    const json = await res.json()
    return json.data as SearchOptions
  } catch {
    return {
      property_types:    ['Rumah', 'Apartemen', 'Ruko', 'Kavling', 'Gudang', 'Gedung'],
      transaction_types: ['Jual', 'Sewa'],
      cities:            ['Surabaya', 'Sidoarjo', 'Gresik', 'Malang'],
      areas:             [],
      statuses:          ['Aktif'],
      harga_min:         0,
      harga_max:         0,
    }
  }
}

export default async function CariPage() {
  const initialOptions = await getInitialOptions()

  return (
    <>
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type':    'WebSite',
        name:        'Mansion Realty — Cari Properti',
        url:         `${BASE}/cari`,
        potentialAction: {
          '@type':       'SearchAction',
          target:        `${BASE}/cari?keyword={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      })}}/>

      <div className="pt-24 pb-20 min-h-screen bg-gray-50">
        <div className="section-wrapper">

          {/* Header */}
          <div className="mb-8">
            <div className="divider-gold mb-3"/>
            <h1 className="section-title">Cari Properti</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Temukan rumah, ruko, tanah, dan properti lainnya di Surabaya & sekitarnya
            </p>
          </div>

          {/* Search Engine */}
          <Suspense fallback={
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-900 rounded-full animate-spin mx-auto mb-4"/>
                <p className="text-gray-500 text-sm">Memuat pencarian...</p>
              </div>
            </div>
          }>
            <SearchEngine initialOptions={initialOptions} />
          </Suspense>

          {/* CTA Banner */}
          <div className="mt-16 bg-primary-900 rounded-2xl p-8 text-center">
            <h2 className="font-display font-bold text-white text-2xl mb-2">
              Tidak menemukan properti yang sesuai?
            </h2>
            <p className="text-white/70 text-sm mb-6">
              Konsultasikan kebutuhan Anda dengan agen kami. Gratis tanpa komitmen.
            </p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_OFFICE || '6281234567890'}?text=${encodeURIComponent('Halo Mansion Realty, saya ingin konsultasi properti.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gold text-primary-900 font-bold px-8 py-3 rounded-xl hover:bg-yellow-400 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Konsultasi via WhatsApp
            </a>
          </div>
        </div>
      </div>

      <WhatsAppButton />
    </>
  )
}
