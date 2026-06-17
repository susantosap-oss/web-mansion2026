import type { Metadata } from 'next'
import Link from 'next/link'
import { getListings } from '@/lib/sheets'
import { ListingCard } from '@/components/property/PropertyCard'
import WhatsAppButton from '@/components/ui/WhatsAppButton'

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
  searchParams: { type?: string; propertyType?: string; priceRange?: string }
}): Promise<Metadata> {
  const { type, propertyType, priceRange } = searchParams
  const allListings = await getListings({ type: type as 'Sale' | 'Rent', propertyType })
  const count = priceRange === 'below'
    ? allListings.filter(l => l.price < 1_000_000_000).length
    : priceRange === 'above'
    ? allListings.filter(l => l.price >= 1_000_000_000).length
    : allListings.length

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

  // Query param pages (filtered views) consolidate to /listings.
  // Specific category targeting is handled by cleanURL pages (/listings/jual-rumah-surabaya).
  const canonical = `${BASE}/listings`

  const hasFilter = !!(type || propertyType || priceRange)

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: !hasFilter, follow: true },
    openGraph: { title, description, url: canonical, type: 'website' },
  }
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: { type?: string; propertyType?: string; priceRange?: string }
}) {
  const { type, propertyType, priceRange } = searchParams
  const allListings = await getListings({ type: type as 'Sale' | 'Rent', propertyType })

  const listings = priceRange === 'below'
    ? allListings.filter(l => l.price < 1_000_000_000)
    : priceRange === 'above'
    ? allListings.filter(l => l.price >= 1_000_000_000)
    : allListings

  const belowCount = allListings.filter(l => l.price < 1_000_000_000).length
  const aboveCount = allListings.filter(l => l.price >= 1_000_000_000).length

  const title = type === 'Sale' ? 'Properti Dijual' : type === 'Rent' ? 'Properti Disewa' : 'Semua Listing'

  function priceUrl(pr?: string) {
    const p = new URLSearchParams()
    if (type) p.set('type', type)
    if (propertyType) p.set('propertyType', propertyType)
    if (pr) p.set('priceRange', pr)
    const q = p.toString()
    return q ? `/listings?${q}` : '/listings'
  }

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

          {/* Type Tabs: Semua / Dijual / Disewa */}
          <div className="flex flex-wrap gap-3 mb-3">
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

          {/* Price Range Tabs */}
          <div className="flex flex-wrap gap-3 mb-8">
            {([
              ['', 'Semua Harga', allListings.length],
              ['below', '< 1 Milyar', belowCount],
              ['above', '> 1 Milyar', aboveCount],
            ] as [string, string, number][]).map(([value, label, count]) => {
              const href = priceUrl(value || undefined)
              const isActive = value === '' ? !priceRange : priceRange === value
              return (
                <Link key={value || 'semua'} href={href}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gold text-primary-900 border-gold'
                      : 'border-gray-200 text-gray-600 hover:border-gold bg-white'
                  }`}>
                  {label}
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-primary-900/20 text-primary-900' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {count}
                  </span>
                </Link>
              )
            })}
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

          {/* Daftar Harga Banner */}
          <div className="mt-12 flex justify-center">
            <Link href="/daftar-harga"
              className="inline-flex items-center gap-3 bg-primary-900 text-white px-8 py-4 rounded-2xl font-semibold text-sm hover:bg-primary-800 transition-colors shadow-lg">
              <span className="text-gold text-lg">📋</span>
              DAFTAR HARGA PROPERTI MANSION
              <span className="text-gold">→</span>
            </Link>
          </div>
        </div>
      </div>

      <WhatsAppButton />
    </>
  )
}
