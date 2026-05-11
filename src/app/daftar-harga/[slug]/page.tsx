import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCleanURLs } from '@/lib/cleanUrls'
import { getProjects, getListings, formatPrice } from '@/lib/sheets'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mansionpro.id'
const WA   = process.env.NEXT_PUBLIC_WA_OFFICE || '628219880889'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug    = decodeURIComponent(params.slug)
  const allURLs = await getCleanURLs()
  const cleanURL = allURLs.find(c => c.pathPrefix === 'daftar-harga' && c.slug === slug && c.active)
  if (!cleanURL) return { title: 'Daftar Harga | Mansion Realty' }
  return {
    title:       cleanURL.title,
    description: cleanURL.description,
    alternates:  { canonical: `${BASE}/daftar-harga/${slug}` },
    openGraph:   { title: cleanURL.title, description: cleanURL.description, url: `${BASE}/daftar-harga/${slug}`, type: 'website' },
  }
}

export default async function DaftarHargaSlugPage({ params }: Props) {
  const slug    = decodeURIComponent(params.slug)
  const allURLs = await getCleanURLs()
  const cleanURL = allURLs.find(c => c.pathPrefix === 'daftar-harga' && c.slug === slug && c.active)
  if (!cleanURL) notFound()

  const [projects, listings] = await Promise.all([getProjects(), getListings()])

  const activeProjects = projects
    .filter(p => p.status === 'Aktif' && p.priceMin > 0 &&
      (!cleanURL.city || p.city?.toLowerCase().includes(cleanURL.city.toLowerCase())))
    .sort((a, b) => a.priceMin - b.priceMin)

  const filteredListings = listings
    .filter(l => l.status === 'Aktif' && l.price > 0 && l.type === 'Sale' &&
      (!cleanURL.propertyType || l.propertyType === cleanURL.propertyType) &&
      (!cleanURL.city || l.city?.toLowerCase().includes(cleanURL.city.toLowerCase())))
    .sort((a, b) => a.price - b.price)
    .slice(0, 10)

  const waUrl = `https://wa.me/${WA}?text=${encodeURIComponent('Halo Mansion Realty, saya ingin tahu informasi harga properti terbaru')}`

  return (
    <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4">

        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-primary-900 transition-colors">Beranda</Link>
          <span>/</span>
          <Link href="/daftar-harga" className="hover:text-primary-900 transition-colors">Daftar Harga</Link>
          <span>/</span>
          <span className="text-primary-900 font-medium">{cleanURL.label}</span>
        </nav>

        <div className="mb-8">
          <div className="divider-gold mb-3" />
          <h1 className="text-2xl md:text-3xl font-bold text-primary-900 mb-3">{cleanURL.h1}</h1>
          <p className="text-gray-600 leading-relaxed text-base max-w-3xl">{cleanURL.description}</p>
        </div>

        {/* Tabel Proyek */}
        {activeProjects.length > 0 && (
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-bold text-primary-900 mb-4">Proyek Aktif — Estimasi Harga</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-primary-900 text-white">
                    <th className="text-left px-4 py-3 rounded-tl-xl font-semibold">Nama Proyek</th>
                    <th className="text-left px-4 py-3 font-semibold">Tipe</th>
                    <th className="text-right px-4 py-3 rounded-tr-xl font-semibold">Harga Mulai</th>
                  </tr>
                </thead>
                <tbody>
                  {activeProjects.map((p, i) => (
                    <tr key={p.id} className={`border-b border-gray-100 hover:bg-primary-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-4 py-3 font-medium">
                        <Link href={`/projects/${p.slug}`} className="text-primary-800 hover:underline">{p.name}</Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{p.type}</td>
                      <td className="px-4 py-3 text-right text-xs font-semibold text-primary-900 whitespace-nowrap">{formatPrice(p.priceMin)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tabel Listing */}
        {filteredListings.length > 0 && (
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-bold text-primary-900 mb-4">Listing Dijual — Harga Properti Mansion</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-primary-900 text-white">
                    <th className="text-left px-4 py-3 rounded-tl-xl font-semibold">Nama Properti</th>
                    <th className="text-left px-4 py-3 font-semibold">Tipe</th>
                    <th className="text-left px-4 py-3 font-semibold">Lokasi</th>
                    <th className="text-right px-4 py-3 rounded-tr-xl font-semibold">Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.map((l, i) => (
                    <tr key={l.id} className={`border-b border-gray-100 hover:bg-primary-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-4 py-3 font-medium">
                        <Link href={`/listings/${l.slug}`} className="text-primary-800 hover:underline">{l.title}</Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{l.propertyType}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{[l.location, l.city].filter(Boolean).join(', ') || '—'}</td>
                      <td className="px-4 py-3 text-right text-xs font-semibold text-primary-900 whitespace-nowrap">{formatPrice(l.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-primary-900 rounded-2xl p-6 text-center text-white mb-6">
          <p className="font-semibold mb-1">Konsultasi Harga Gratis</p>
          <p className="text-primary-100 text-sm mb-4">Tanya estimasi harga, simulasi KPR, atau jadwalkan survei properti.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
              💬 Tanya via WhatsApp
            </a>
            <Link href="/daftar-harga"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-900 font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-primary-50 transition-colors">
              📋 Lihat Semua Daftar Harga
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
