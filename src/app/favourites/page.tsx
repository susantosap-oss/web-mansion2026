'use client'
import { useState, useEffect } from 'react'
import BackButton from '@/components/ui/BackButton'
import Link from 'next/link'
import { useFavourite } from '@/hooks/useFavourite'

export default function FavouritesPage() {
  const { favourites, clear, total } = useFavourite()
  const [listings, setListings]      = useState<any[]>([])
  const [loading, setLoading]        = useState(true)

  useEffect(() => {
    if (favourites.length === 0) { setLoading(false); return }
    fetch('/api/sheets?action=getListings')
      .then(r => r.json())
      .then(json => {
        const favListings = (json.data || []).filter((l: any) => favourites.includes(l['ID']))
        setListings(favListings)
      })
      .finally(() => setLoading(false))
  }, [favourites])

  function formatPrice(price: number): string {
    if (!price) return 'Harga Nego'
    if (price >= 1_000_000_000) return `Rp ${(price/1_000_000_000).toFixed(1).replace('.0','')} M`
    if (price >= 1_000_000)     return `Rp ${(price/1_000_000).toFixed(0)} Jt`
    return `Rp ${price.toLocaleString('id-ID')}`
  }

  return (
    <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
      <div className="section-wrapper">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="divider-gold mb-3"/>
            <h1 className="section-title">❤️ Properti Favorit</h1>
            <p className="text-gray-400 mt-1">{total} properti tersimpan</p>
          </div>
          {total > 0 && (
            <button onClick={clear} className="text-sm text-red-400 hover:text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
              🗑 Hapus Semua
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20"><div className="text-5xl animate-bounce mb-4">⏳</div><p className="text-gray-400">Memuat...</p></div>
        ) : total === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💔</div>
            <h3 className="font-display font-bold text-primary-900 text-xl mb-2">Belum ada favorit</h3>
            <p className="text-gray-400 mb-6">Klik ikon ❤️ di kartu properti untuk menyimpan ke favorit</p>
            <Link href="/listings" className="btn-primary">🏠 Jelajahi Properti</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((l: any) => (
              <Link key={l['ID']} href={`/listings/${l['ID']}`} className="card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden">
                  {l['Foto_Utama_URL']
                    ? <img src={l['Foto_Utama_URL']} alt={l['Judul']} className="object-cover w-full h-full property-image"/>
                    : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-4xl">🏠</div>
                  }
                  <span className={`absolute top-3 left-3 badge ${l['Status_Transaksi']?.toLowerCase().includes('jual') ? 'badge-sale' : 'badge-rent'}`}>
                    {l['Status_Transaksi']?.toLowerCase().includes('jual') ? 'Dijual' : 'Disewa'}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-400 mb-1">📍 {l['Kota']}</p>
                  <h3 className="font-display font-semibold text-primary-900 line-clamp-2 mb-2">{l['Judul']}</h3>
                  <p className="price-display">{formatPrice(Number(l['Harga']))}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
