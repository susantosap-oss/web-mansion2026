import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getListings, formatPrice } from '@/lib/sheets'
import BackButton from '@/components/ui/BackButton'
import FavButton from '@/components/ui/FavButton'
import ImageGallery from '@/components/property/ImageGallery'
import ListingDetailClient from './ListingDetailClient'

export const dynamic = 'force-dynamic'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug     = decodeURIComponent(params.slug)
  const listings = await getListings()
  const listing  = listings.find(l => l.slug === slug || l.id === slug)
  if (!listing) return { title: 'Listing Tidak Ditemukan' }

  const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mansionpro.id'
  const title      = `${listing.title} — Mansion Realty`
  const priceStr   = formatPrice(listing.price)
  const lokasi     = [listing.location, listing.city].filter(Boolean).join(', ')
  const description = `${listing.type === 'Sale' ? 'Dijual' : 'Disewa'}: ${listing.title} di ${lokasi}. Harga ${priceStr}. ${listing.description ? listing.description.slice(0, 100) + '…' : 'Hubungi Mansion Realty untuk info lebih lanjut.'}`
  const imageUrl   = listing.coverImage || null

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url:    `${siteUrl}/listings/${listing.slug}`,
      type:   'website',
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: listing.title }] : [],
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description,
      images:      imageUrl ? [imageUrl] : [],
    },
  }
}

function RealEstateSchema({ listing }: { listing: any }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mansionpro.id'
  const images  = listing.images?.length > 0 ? listing.images : (listing.coverImage ? [listing.coverImage] : [])

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: listing.title,
    description: listing.description,
    url: `${siteUrl}/listings/${listing.slug}`,
    image: images,
    offers: { '@type': 'Offer', price: listing.price, priceCurrency: 'IDR' },
    address: {
      '@type': 'PostalAddress',
      addressLocality: listing.city,
      addressRegion: listing.province,
      addressCountry: 'ID',
      streetAddress: listing.address,
    },
  }

  if (listing.kamarTidur > 0)    schema.numberOfBedrooms       = listing.kamarTidur
  if (listing.kamarMandi > 0)    schema.numberOfBathroomsTotal  = listing.kamarMandi
  if (listing.luasBangunan > 0)  schema.floorSize = { '@type': 'QuantitativeValue', value: listing.luasBangunan, unitCode: 'MTK' }
  if (listing.luasTanah > 0)     schema.lotSize   = { '@type': 'QuantitativeValue', value: listing.luasTanah,    unitCode: 'MTK' }
  if (listing.carport > 0)       schema.numberOfParkingSpaces  = listing.carport

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Beranda',  item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Listing',  item: `${siteUrl}/listings` },
      { '@type': 'ListItem', position: 3, name: listing.title, item: `${siteUrl}/listings/${listing.slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}/>
    </>
  )
}

export default async function ListingDetailPage({ params }: Props) {
  const slug     = decodeURIComponent(params.slug)
  const listings = await getListings()
  const listing  = listings.find(l => l.slug === slug || l.id === slug)
  if (!listing) notFound()

  const waKantor = `https://wa.me/${process.env.NEXT_PUBLIC_WA_OFFICE || '6281234567890'}?text=${encodeURIComponent(`Halo, saya tertarik dengan properti:\n*${listing.title}*\nHarga: ${formatPrice(listing.price)}\n\nBisa info lebih lanjut?`)}`

  const images = listing.images?.length > 0 ? listing.images : (listing.coverImage ? [listing.coverImage] : [])

  const specs = [
    { icon:'📐', label:'Luas Tanah',    value: listing.luasTanah > 0    ? `${listing.luasTanah} m²`    : null },
    { icon:'🏗',  label:'Luas Bangunan', value: listing.luasBangunan > 0 ? `${listing.luasBangunan} m²` : null },
    { icon:'🛏',  label:'Kamar Tidur',   value: listing.kamarTidur > 0   ? `${listing.kamarTidur} KT`   : null },
    { icon:'🚿',  label:'Kamar Mandi',   value: listing.kamarMandi > 0   ? `${listing.kamarMandi} KM`   : null },
    { icon:'🚗',  label:'Garasi',        value: listing.carport > 0      ? `${listing.carport} Mobil`   : null },
    { icon:'🏢',  label:'Lantai',        value: listing.lantai > 0       ? `${listing.lantai} Lantai`   : null },
    { icon:'📄',  label:'Sertifikat',    value: listing.sertifikat || null },
    { icon:'🏚',  label:'Kondisi',       value: listing.kondisi || null },
  ].filter(s => s.value)

  return (
    <>
      <RealEstateSchema listing={listing} />
      <div className="pt-24 pb-16 bg-white min-h-screen">
        <div className="section-wrapper">
          <BackButton label="Kembali ke Listing" />

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
            <div className="lg:col-span-2">
              {/* Gallery */}
              <div className="relative mb-6">
                <ImageGallery images={images} title={listing.title} />
                {/* Badge overlay — ditampilkan di atas gallery */}
                <div className="absolute top-4 left-4 flex gap-2 z-10 pointer-events-none">
                  <span className={listing.type === 'Sale' ? 'badge-sale' : 'badge-rent'}>
                    {listing.type === 'Sale' ? '🏷 Dijual' : '🔑 Disewa'}
                  </span>
                  <span className="badge bg-white/90 text-gray-700">{listing.propertyType}</span>
                </div>
                <div className="absolute top-4 right-4 z-10">
                  <FavButton listingId={listing.id} />
                </div>
              </div>

              {/* Judul & Harga */}
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-primary-900 mb-2 leading-tight">{listing.title}</h1>
                <p className="text-gray-500 flex items-center gap-1 text-sm mb-4">
                  📍 {listing.address && `${listing.address}, `}{listing.location}, {listing.city}
                </p>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-4xl font-bold text-primary-900">{formatPrice(listing.price)}</span>
                  {listing.priceUnit !== 'Jual' && <span className="text-gray-400">/ {listing.priceUnit.replace('Sewa/','')}</span>}
                </div>
              </div>

              {/* Spesifikasi */}
              {specs.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <h2 className="font-bold text-primary-900 mb-4 text-lg">Spesifikasi Properti</h2>
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
              )}

              {/* Deskripsi */}
              {listing.description && (
                <div className="mb-6">
                  <h2 className="font-bold text-primary-900 mb-3 text-lg">Deskripsi</h2>
                  <div className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">{listing.description}</div>
                </div>
              )}

              {/* Info */}
              <div className="bg-primary-50 rounded-2xl p-5">
                <h2 className="font-bold text-primary-900 mb-3 text-sm uppercase tracking-wide">Info Listing</h2>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { dt:'Kode',dd:listing.id },{ dt:'Status',dd:listing.status },
                    { dt:'Tipe',dd:listing.propertyType },{ dt:'Sertifikat',dd:listing.sertifikat },
                  ].map(item => (
                    <div key={item.dt}>
                      <dt className="text-gray-400 text-xs">{item.dt}</dt>
                      <dd className="font-semibold text-primary-900">{item.dd}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Sidebar — semua interaktif dipisah ke Client */}
            <div className="lg:col-span-1">
              <ListingDetailClient
                listing={listing}
                waKantor={waKantor}
              />

              {/* Berita properti terkait */}
              <div className="mt-4 card p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Baca Juga</p>
                <Link
                  href={`/news?q=${encodeURIComponent(listing.city || 'Surabaya')}`}
                  className="flex items-start gap-2 group hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors"
                >
                  <span className="text-xl flex-shrink-0">📰</span>
                  <div>
                    <p className="text-sm font-semibold text-primary-900 group-hover:text-gold transition-colors leading-snug">
                      Berita &amp; Tips Properti {listing.city || 'Surabaya'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Panduan investasi dan info pasar properti terkini
                    </p>
                  </div>
                </Link>
                <Link
                  href="/news?category=KPR+%26+Pembiayaan"
                  className="flex items-start gap-2 group hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors mt-1"
                >
                  <span className="text-xl flex-shrink-0">🏦</span>
                  <div>
                    <p className="text-sm font-semibold text-primary-900 group-hover:text-gold transition-colors leading-snug">
                      Cara KPR &amp; Simulasi Cicilan {listing.propertyType}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Tips mengajukan KPR untuk {listing.propertyType.toLowerCase()}
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
