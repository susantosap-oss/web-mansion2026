import { Metadata } from 'next'
import Link from 'next/link'
import { getProjects, getListings, formatPrice } from '@/lib/sheets'

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mansionpro.id'
const WA   = process.env.NEXT_PUBLIC_WA_OFFICE || '628219880889'

export const metadata: Metadata = {
  title: 'Daftar Harga Rumah & Proyek Mansion Properti — Update Mei 2026',
  description: 'Lihat daftar harga rumah, ruko, gudang & proyek properti terbaru Mansion Realty di Surabaya dan Sidoarjo. Harga mulai ratusan juta. Konsultasi & survei gratis.',
  alternates: { canonical: `${BASE}/daftar-harga` },
  openGraph: {
    title: 'Daftar Harga Properti Mansion Realty — Update Mei 2026',
    description: 'Daftar lengkap harga rumah Mansion, ruko, gudang & proyek di Surabaya-Sidoarjo. Transparent pricing, KPR tersedia.',
    url: `${BASE}/daftar-harga`,
    type: 'website',
  },
}

// ── Data kategori internal link ─────────────────────────────
const INTERNAL_LINKS = [
  {
    kategori: '🏠 Rumah',
    links: [
      { label: 'Rumah Dijual di Surabaya',  href: '/listings/jual-rumah-surabaya'         },
      { label: 'Rumah Dijual di Sidoarjo',  href: '/listings/jual-rumah-sidoarjo'         },
      { label: 'Rumah Disewa di Surabaya',  href: '/listings/sewa-rumah-surabaya'         },
      { label: 'Harga Rumah Mansion',       href: '/listings/harga-rumah-mansion'         },
      { label: 'Harga Rumah Terbaru 2026',  href: '/listings/harga-rumah-mansion-terbaru' },
    ],
  },
  {
    kategori: '🏢 Ruko',
    links: [
      { label: 'Ruko Disewa di Surabaya',   href: '/listings/sewa-ruko-surabaya'       },
      { label: 'Ruko Investasi Surabaya',   href: '/listings/ruko-investasi-surabaya'  },
      { label: 'Harga Ruko Surabaya',       href: '/listings/harga-ruko-surabaya'      },
      { label: 'Ruko Surabaya 2026',        href: '/listings/ruko-surabaya-2026'       },
    ],
  },
  {
    kategori: '🏭 Gudang',
    links: [
      { label: 'Gudang Dijual di Surabaya',  href: '/listings/jual-gudang-surabaya'       },
      { label: 'Gudang Disewa di Surabaya',  href: '/listings/sewa-gudang-surabaya'       },
      { label: 'Gudang Dekat Tol Surabaya',  href: '/listings/gudang-dekat-tol-surabaya'  },
      { label: 'Gudang Dijual di Gresik',    href: '/listings/jual-gudang-gresik'         },
      { label: 'Gudang Disewa di Gresik',    href: '/listings/sewa-gudang-gresik'         },
    ],
  },
  {
    kategori: '🌆 Semua Properti',
    links: [
      { label: 'Properti di Surabaya',         href: '/listings/surabaya'      },
      { label: 'Properti Dijual di Surabaya',  href: '/listings/jual-surabaya' },
      { label: 'Properti Disewa di Surabaya',  href: '/listings/sewa-surabaya' },
    ],
  },
  {
    kategori: '👤 Agen & Info',
    links: [
      { label: 'Agen Properti Surabaya',        href: '/agents/agen-properti-surabaya'    },
      { label: 'Berita Properti Terkini',       href: '/news/berita-properti'             },
      { label: 'Jasa Kelola Properti Surabaya', href: '/news/management-properti'         },
    ],
  },
]

export default async function DaftarHargaPage() {
  const [projects, listings] = await Promise.all([
    getProjects(),
    getListings(),
  ])

  const activeProjects = projects
    .filter(p => p.status === 'Aktif' && p.priceMin > 0)
    .sort((a, b) => a.priceMin - b.priceMin)

  const featuredListings = listings
    .filter(l => l.status === 'Aktif' && l.price > 0 && l.type === 'Sale')
    .sort((a, b) => a.price - b.price)
    .slice(0, 10)

  const waUrl = `https://wa.me/${WA}?text=${encodeURIComponent('Halo Mansion Realty, saya ingin tahu informasi harga properti terbaru')}`

  return (
    <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-primary-900 transition-colors">Beranda</Link>
          <span>/</span>
          <span className="text-primary-900 font-medium">Daftar Harga</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="divider-gold mb-3" />
          <h1 className="text-2xl md:text-3xl font-bold text-primary-900 mb-3">
            Daftar Harga Rumah &amp; Proyek Mansion Properti — Update Mei 2026
          </h1>
          <p className="text-gray-600 leading-relaxed text-base max-w-3xl">
            Mansion Realty menyediakan berbagai pilihan hunian dan properti komersial mulai dari
            kelas menengah hingga premium di <strong>Surabaya</strong> dan <strong>Sidoarjo</strong>.
            Temukan <em>harga rumah Mansion</em> yang transparan, KPR tersedia, dan didukung agen
            bersertifikat BNSP. Data harga diperbarui setiap bulan sesuai kondisi pasar properti
            Surabaya terkini.
          </p>
        </div>

        {/* ── Tabel Proyek Baru ─────────────────────────────── */}
        {activeProjects.length > 0 && (
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-bold text-primary-900 mb-1">Proyek Perumahan Baru — Harga &amp; Tipe</h2>
            <p className="text-sm text-gray-400 mb-4">
              Proyek aktif yang sedang dipasarkan oleh Mansion Realty. Klik nama proyek untuk detail lengkap.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-primary-900 text-white">
                    <th className="text-left px-4 py-3 rounded-tl-xl font-semibold">Nama Proyek</th>
                    <th className="text-left px-4 py-3 font-semibold">Tipe Properti</th>
                    <th className="text-left px-4 py-3 font-semibold">Developer</th>
                    <th className="text-right px-4 py-3 rounded-tr-xl font-semibold">Harga Mulai</th>
                  </tr>
                </thead>
                <tbody>
                  {activeProjects.map((p, i) => (
                    <tr key={p.id}
                      className={`border-b border-gray-100 hover:bg-primary-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-4 py-3 font-medium">
                        <Link
                          href={`/projects/${p.slug}`}
                          className="text-primary-800 hover:text-primary-600 hover:underline transition-colors">
                          {p.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.type}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{p.developer || '—'}</td>
                      <td className="px-4 py-3 text-right text-xs font-semibold text-primary-900 whitespace-nowrap">
                        {formatPrice(p.priceMin)}
                        {p.priceMax > p.priceMin && (
                          <span className="font-normal text-gray-400 block">
                            s/d {formatPrice(p.priceMax)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              * Harga dapat berubah sewaktu-waktu. Hubungi agen untuk informasi terkini dan ketersediaan unit.
            </p>
          </div>
        )}

        {/* ── Tabel Listing Dijual ──────────────────────────── */}
        {featuredListings.length > 0 && (
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-bold text-primary-900 mb-1">Listing Properti Dijual — Harga Rumah Mansion</h2>
            <p className="text-sm text-gray-400 mb-4">
              Pilihan properti Surabaya &amp; Sidoarjo yang sedang aktif dipasarkan. Klik untuk lihat detail &amp; foto.
            </p>
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
                  {featuredListings.map((l, i) => (
                    <tr key={l.id}
                      className={`border-b border-gray-100 hover:bg-primary-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-4 py-3 font-medium">
                        <Link
                          href={`/listings/${l.slug}`}
                          className="text-primary-800 hover:text-primary-600 hover:underline transition-colors">
                          {l.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{l.propertyType}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {[l.location, l.city].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-primary-900 text-xs whitespace-nowrap">
                        {formatPrice(l.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-center">
              <Link href="/listings/jual-rumah-surabaya"
                className="text-sm text-primary-700 hover:underline font-medium">
                Lihat semua properti dijual di Surabaya →
              </Link>
            </div>
          </div>
        )}

        {/* ── Keunggulan ───────────────────────────────────── */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-bold text-primary-900 mb-4">
            Keunggulan Membeli Properti di Mansion Realty
          </h2>
          <ul className="space-y-3">
            {[
              { icon: '✅', title: 'Legalitas Aman & Transparan', desc: 'Semua properti dicek dokumen SHM/HGB sebelum dipasarkan. Proses balik nama didampingi notaris rekanan.' },
              { icon: '💳', title: 'Cicilan Ringan, KPR Mudah', desc: 'Kami bermitra dengan 10+ bank untuk KPR terbaik. Simulasi cicilan gratis, proses pengajuan dipandu agen.' },
              { icon: '📍', title: 'Lokasi Strategis Surabaya & Sidoarjo', desc: 'Properti dekat tol, pusat kota, sekolah, dan fasilitas publik. Cocok hunian maupun investasi.' },
              { icon: '🏆', title: 'Agen Bersertifikat BNSP', desc: 'Tim agen Mansion Realty tersertifikasi nasional. Pengalaman di pasar properti Surabaya lebih dari 5 tahun.' },
              { icon: '🔍', title: 'Harga Rumah Mansion Terbaik & Nego', desc: 'Kami bantu negosiasi harga terbaik untuk pembeli. Data harga pasar selalu diperbarui setiap bulan.' },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <p className="font-semibold text-primary-900 text-sm">{item.title}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* ── CTA ──────────────────────────────────────────── */}
        <div className="bg-primary-900 rounded-2xl p-8 mb-8 text-center text-white">
          <h2 className="text-xl font-bold mb-2">
            Konsultasi Harga Properti Gratis
          </h2>
          <p className="text-primary-100 text-sm mb-6 max-w-xl mx-auto">
            Hubungi agen Mansion Realty sekarang — bandingkan harga rumah Mansion,
            simulasi KPR, dan jadwalkan survei properti Surabaya &amp; Sidoarjo tanpa biaya.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              💬 Tanya via WhatsApp
            </a>
            <Link href="/agents/agen-properti-surabaya"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-900 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors">
              👤 Temui Agen Kami
            </Link>
          </div>
        </div>

        {/* ── Internal Links ────────────────────────────────── */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-primary-900 mb-4">
            Jelajahi Properti Surabaya Berdasarkan Kategori
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {INTERNAL_LINKS.map(group => (
              <div key={group.kategori}>
                <p className="text-sm font-semibold text-primary-800 mb-2">{group.kategori}</p>
                <ul className="space-y-1.5">
                  {group.links.map(link => (
                    <li key={link.href}>
                      <Link href={link.href}
                        className="text-sm text-gray-600 hover:text-primary-700 hover:underline transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
