'use client'
import { useState } from 'react'
import { Listing } from '@/types'
import { ListingCard } from './PropertyCard'
import Pagination from '@/components/ui/Pagination'
import Link from 'next/link'

const PER_PAGE = 15

export default function ListingsGrid({ listings }: { listings: Listing[] }) {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(listings.length / PER_PAGE)
  const paginated  = listings.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  if (listings.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="font-display font-bold text-primary-900 text-xl mb-2">Properti tidak ditemukan</h3>
        <Link href="/listings" className="btn-primary mt-4">Lihat Semua Listing</Link>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginated.map((l, i) => <ListingCard key={l.id} listing={l} priority={i === 0 && page === 1}/>)}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={p => setPage(p)}/>
    </>
  )
}
