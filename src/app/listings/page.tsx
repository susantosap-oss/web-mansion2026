import type { Metadata } from 'next'
import Link from 'next/link'
import { getListings } from '@/lib/sheets'
import { ListingCard } from '@/components/property/PropertyCard'

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mansionpro.id'

const PROP_TYPE_LABELS: Record<string, string> = {
  Rumah:     'Rumah',
  Apartemen: 'Apartemen',
  Ruko:      'Ruko',
  Kavling:   'Kavling',
  Gudang:    'Gudang',
  Gedung:    'Gedung',
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { type?: string; propertyType?: string }
}): Promise<Metadata> {
  const { type, propertyType } = searchParams
  const listings = await getListings({ type: type as 'Sale' | 'Rent', propertyType })
  const count = listings.length

  const typeLabel = type === 'Sale' ? 'Dijual' : type === 'Rent' ? 'Disewa' : 'Dijual & Disewa'
  const propLabel = propertyType ? (PROP_TYPE_LABELS[propertyType] ?? propertyType) : 'Properti'

  const title = propertyType
    ? `${propLabel} ${typeLabel} di Surabaya — ${count} Pilihan | Mansion Realty`
    : type
    ? `${count} Properti ${typeLabel} di Surabaya | Mansion Realty`
    : `Properti Dijual & Disewa Surabaya — ${count} Listing | Mansion Realty`

  const description = propertyType
    ? `Daftar ${propLabel.toLowerCase()} ${typeLabel.toLowerCase()} di Surabaya: harga, lokasi, dan spesifikasi lengkap. ${count} pilihan tersedia, konsultasi agen gratis.`
    : `${count} listing properti dijual dan disewa di Surabaya. Rumah, ruko, apartemen, kavling & gudang dari agen terpercaya Mansion Realty.`

  const canonical = propertyType
    ? `${BASE}/listings?${type ? `type=${type}&` : ''}propertyType=${propertyType}`
    : type
    ? `${BASE}/listings?type=${type}`
    : `${BASE}/listings`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website' },
  }
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: { type?: string; propertyType?: string }
}) {
  const { type, propertyType } = searchParams
  const listings = await getListings({ type: type as 'Sale' | 'Rent', propertyType })
  const title = type === 'Sale' ? 'Properti Dijual' : type === 'Rent' ? 'Properti Disewa' : 'Semua Listing'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type':    'ItemList',
    name:        title,
    numberOfItems: listings.length,
    url:         `${BASE}/listings`,
    itemListElement: listings.slice(0, 20).map((l, i) => ({
      '@type':    'ListItem',
      position:   i + 1,
      item: {
        '@type':     'RealEstateListing',
        name:        l.title,
        url:         `${BASE}/listings/${l.slug}`,
        image:       l.coverImage || undefined,
        offers: {
          '@type':       'Offer',
          priceCurrency: 'IDR',
          price:         l.price,
        },
        address: {
          '@type':         'PostalAddress',
          addressLocality: l.city,
          addressCountry:  'ID',
        },
      },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}/>

      <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
        <div className="section-wrapper">
          <div className="mb-8">
            <div className="divider-gold mb-3"/>
            <h1 className="section-title">{title}</h1>
            <p className="text-gray-500 mt-2">{listings.length} properti ditemukan</p>
          </div>
          <div className="flex flex-wrap gap-3 mb-8">
            {[['Semua', '/listings'], ['Dijual', '/listings?type=Sale'], ['Disewa', '/listings?type=Rent']].map(([label, href]) => (
              <Link key={href as string} href={href as string}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${(href === '/listings' && !type) || (href as string).includes(type || 'XX') ? 'bg-primary-900 text-white border-primary-900' : 'border-gray-200 text-gray-600 hover:border-primary-300 bg-white'}`}>
                {label}
              </Link>
            ))}
            {['Rumah', 'Apartemen', 'Ruko', 'Kavling', 'Gudang'].map(pt => (
              <Link key={pt} href={`/listings${type ? `?type=${type}&` : '?'}propertyType=${pt}`}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${propertyType === pt ? 'bg-gold text-primary-900 border-gold' : 'border-gray-200 text-gray-600 hover:border-gold bg-white'}`}>
                {pt}
              </Link>
            ))}
          </div>
          {listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((l, i) => <ListingCard key={l.id} listing={l} priority={i === 0}/>)}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-display font-bold text-primary-900 text-xl mb-2">Properti tidak ditemukan</h3>
              <Link href="/listings" className="btn-primary mt-4">Lihat Semua Listing</Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
