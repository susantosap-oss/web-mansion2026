'use client'
import { useFavourite } from '@/hooks/useFavourite'

export default function FavButton({ listingId, className = '' }: { listingId: string; className?: string }) {
  const { isFavourite, toggle } = useFavourite()
  const fav = isFavourite(listingId)

  return (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(listingId) }}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
        fav
          ? 'bg-red-500 text-white scale-110'
          : 'bg-white/90 text-gray-400 hover:text-red-400 hover:bg-white'
      } shadow-md ${className}`}
      title={fav ? 'Hapus dari favorit' : 'Simpan ke favorit'}
      aria-label={fav ? 'Hapus favorit' : 'Tambah favorit'}
    >
      <svg className="w-4 h-4" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
      </svg>
    </button>
  )
}
