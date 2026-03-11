import type { Metadata } from 'next'
import Link from 'next/link'
import BackButton from '@/components/ui/BackButton'
import { getListings } from '@/lib/sheets'
import { ListingCard } from '@/components/property/PropertyCard'

export const revalidate = 300
export const metadata: Metadata = { title: 'Properti Dijual & Disewa | Mansion Realty' }

export default async function ListingsPage({ searchParams }: { searchParams: { type?: string; propertyType?: string } }) {
  const { type, propertyType } = searchParams
  const listings = await getListings({ type: type as 'Sale' | 'Rent', propertyType })
  const title = type === 'Sale' ? 'Properti Dijual' : type === 'Rent' ? 'Properti Disewa' : 'Semua Listing'

  return (
    <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
      <div className="section-wrapper">
        <div className="mb-8"><div className="divider-gold mb-3"/><h1 className="section-title">{title}</h1><p className="text-gray-500 mt-2">{listings.length} properti ditemukan</p></div>
        <div className="flex flex-wrap gap-3 mb-8">
          {[['Semua','/listings'],['Dijual','/listings?type=Sale'],['Disewa','/listings?type=Rent']].map(([label,href]) => (
            <Link key={href as string} href={href as string}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${(href === '/listings' && !type) || (href as string).includes(type||'XX') ? 'bg-primary-900 text-white border-primary-900' : 'border-gray-200 text-gray-600 hover:border-primary-300 bg-white'}`}>
              {label}
            </Link>
          ))}
          {['Rumah','Apartemen','Ruko','Kavling'].map(pt => (
            <Link key={pt} href={`/listings${type?`?type=${type}&`:'?'}propertyType=${pt}`}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${propertyType===pt?'bg-gold text-primary-900 border-gold':'border-gray-200 text-gray-600 hover:border-gold bg-white'}`}>
              {pt}
            </Link>
          ))}
        </div>
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(l => <ListingCard key={l.id} listing={l}/>)}
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
  )
}
