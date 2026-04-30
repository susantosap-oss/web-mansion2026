import Link from 'next/link'
import Image from 'next/image'
import { getListings, formatPrice } from '@/lib/sheets'
import { Listing } from '@/types'

interface Props {
  tags: string[]
  newsCategory: string
  newsSlug: string
}

function matchListings(listings: Listing[], terms: string[]): Listing[] {
  if (terms.length === 0) return []

  return listings
    .filter(l => !!l.coverImage)
    .map(l => {
      const haystack = [l.city, l.location, l.address, l.title, l.propertyType]
        .join(' ').toLowerCase()
      const score = terms.reduce((acc, t) => acc + (haystack.includes(t) ? 2 : 0), 0)
        + (haystack.includes(terms[0]) ? 1 : 0)
      return { listing: l, score }
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(x => x.listing)
}

function altText(l: Listing): string {
  const jenis = l.type === 'Sale' ? 'Dijual' : 'Disewa'
  return `${l.propertyType} ${jenis} di ${[l.location, l.city].filter(Boolean).join(', ')}`
}

export default async function RelatedProperties({ tags, newsCategory, newsSlug }: Props) {
  const terms = tags.map(t => t.toLowerCase().trim()).filter(Boolean)
  if (terms.length === 0) return null

  const allListings = await getListings()
  const matched = matchListings(allListings, terms)
  if (matched.length === 0) return null

  const locationLabel = tags[0]
    ? tags[0].charAt(0).toUpperCase() + tags[0].slice(1).toLowerCase()
    : 'Area Ini'

  return (
    <section aria-label={`Properti terkait di ${locationLabel}`} className="mt-10 pt-8 border-t border-gray-100">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-1 bg-gold rounded-full flex-shrink-0"/>
        <h2 className="font-display font-bold text-primary-900 text-lg">
          Properti Terkait di {locationLabel}
        </h2>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Pilihan properti yang relevan dengan topik artikel ini
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {matched.map(listing => {
          const jenis  = listing.type === 'Sale' ? 'Dijual' : 'Disewa'
          const lokasi = [listing.location, listing.city].filter(Boolean).join(', ')
          const linkTitle = `${listing.propertyType} ${jenis} di ${lokasi} — ${formatPrice(listing.price)}`

          return (
            <Link
              key={listing.id}
              href={`/listings/${listing.slug}`}
              title={linkTitle}
              className="card group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 flex flex-col"
            >
              {/* Gambar */}
              <div className="relative h-32 md:h-40 overflow-hidden bg-gray-100 flex-shrink-0">
                <Image
                  src={listing.coverImage}
                  alt={altText(listing)}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                <span className={`absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  listing.type === 'Sale' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                }`}>
                  {jenis}
                </span>
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col flex-1">
                <p className="text-[11px] text-gray-500 mb-1 truncate">📍 {lokasi}</p>
                <h3 className="text-xs md:text-sm font-semibold text-primary-900 line-clamp-2 leading-snug mb-2 group-hover:text-gold transition-colors flex-1">
                  {listing.title}
                </h3>
                <p className="text-sm font-bold text-primary-900 mb-2">
                  {formatPrice(listing.price)}
                </p>
                <span className="text-[11px] text-primary-700 font-semibold border border-primary-200 px-2 py-1 rounded-lg text-center group-hover:bg-primary-900 group-hover:text-white group-hover:border-primary-900 transition-all">
                  Lihat Unit →
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Link ke semua listing di area ini */}
      <div className="mt-4 text-right">
        <Link
          href={`/listings?q=${encodeURIComponent(tags[0] || '')}`}
          className="text-sm text-primary-700 font-semibold hover:text-gold transition-colors"
        >
          Lihat semua properti di {locationLabel} →
        </Link>
      </div>
    </section>
  )
}
