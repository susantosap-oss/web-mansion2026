import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getListings, formatPrice, buildWALink } from '@/lib/sheets'
import BackButton from '@/components/ui/BackButton'
import FavButton from '@/components/ui/FavButton'
import ListingDetailClient from './ListingDetailClient'

export const dynamic = 'force-dynamic'

interface Props { params: { slug: string } }

function RealEstateSchema({ listing }: { listing: any }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: listing.title,
    description: listing.description,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/listings/${listing.slug}`,
    image: listing.images?.length > 0 ? listing.images : [listing.coverImage],
    offers: { '@type': 'Offer', price: listing.price, priceCurrency: 'IDR' },
    address: {
      '@type': 'PostalAddress',
      addressLocality: listing.city,
      addressRegion: listing.province,
      addressCountry: 'ID',
      streetAddress: listing.address,
    },
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/>
}

export default async function ListingDetailPage({ params }: Props) {
  const slug     = decodeURIComponent(params.slug)
  const listings = await getListings()
  const listing  = listings.find(l => l.slug === slug || l.id === slug)
  if (!listing) notFound()

  const waMessage = `Halo kak, saya tertarik dengan properti:\n*${listing.title}*\nHarga: ${formatPrice(listing.price)}\n\nBisa info lebih lanjut?`
  const waLink    = buildWALink(listing.agentPhone, waMessage)
  const waKantor  = `https://wa.me/${process.env.NEXT_PUBLIC_WA_OFFICE || '6281234567890'}?text=${encodeURIComponent(waMessage)}`

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
              <div className="rounded-2xl overflow-hidden mb-6 bg-gray-100">
                <div className="relative h-72 md:h-[460px]">
                  {listing.coverImage ? (
                    <Image src={listing.coverImage} alt={listing.title} fill className="object-cover" priority sizes="66vw"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">🏠</div>
                  )}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={listing.type === 'Sale' ? 'badge-sale' : 'badge-rent'}>
                      {listing.type === 'Sale' ? '🏷 Dijual' : '🔑 Disewa'}
                    </span>
                    <span className="badge bg-white/90 text-gray-700">{listing.propertyType}</span>
                  </div>
                  {/* Fav button — client component */}
                  <div className="absolute top-4 right-4">
                    <FavButton listingId={listing.id} />
                  </div>
                </div>
                {listing.images && listing.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-1 mt-1">
                    {listing.images.slice(1, 5).map((img: string, i: number) => (
                      <div key={i} className="relative h-20 overflow-hidden bg-gray-200">
                        <Image src={img} alt={`foto ${i+2}`} fill className="object-cover hover:scale-105 transition-transform"/>
                      </div>
                    ))}
                  </div>
                )}
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
                waLink={waLink}
                waKantor={waKantor}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
