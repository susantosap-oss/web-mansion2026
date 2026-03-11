'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Listing } from '@/types'
import { formatPrice } from '@/lib/sheets'

interface Props {
  listing: Listing
  waLink: string
  waKantor: string
}

export default function ListingDetailClient({ listing, waLink, waKantor }: Props) {
  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    navigator?.clipboard?.writeText(url)
      .then(() => alert('Link berhasil disalin!'))
  }

  const targetWa = listing.agentPhone ? waLink : waKantor

  return (
    <div className="sticky top-24 space-y-4">

      {/* Agent Card */}
      <div className="card p-5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Hubungi Agen</h3>
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-primary-100 flex-shrink-0 flex items-center justify-center">
            {listing.agentPhoto ? (
              <Image src={listing.agentPhoto} alt={listing.agentName || 'Agen'}
                width={56} height={56} className="object-cover w-full h-full"/>
            ) : (
              <span className="text-primary-900 font-bold text-xl">
                {(listing.agentName || 'A').charAt(0)}
              </span>
            )}
          </div>
          <div>
            <p className="font-bold text-primary-900">
              {listing.agentName && !listing.agentName.startsWith('[')
                ? listing.agentName
                : 'Agen Mansion Realty'}
            </p>
            <p className="text-xs text-gray-400">Agen Properti</p>
            {listing.agentPhone && (
              <p className="text-xs text-gray-400 mt-0.5">📱 {listing.agentPhone}</p>
            )}
          </div>
        </div>

        {/* WA Button */}
        <a href={targetWa} target="_blank" rel="noopener noreferrer"
           className="btn-wa w-full justify-center py-3 mb-3">
          💬 Chat WhatsApp Agen
        </a>

        {/* Lihat semua agen */}
        <Link href="/agents"
          className="block text-center text-xs text-gray-400 hover:text-primary-900 transition-colors">
          Lihat semua agen →
        </Link>
      </div>

      {/* KPR CTA */}
      <div className="card p-5 bg-amber-50 border-gold/30">
        <p className="text-sm font-semibold text-primary-900 mb-1">💡 Simulasi KPR</p>
        <p className="text-xs text-gray-500 mb-3">
          Estimasi cicilan mulai{' '}
          <strong className="text-primary-900">
            Rp {Math.round(listing.price * 0.008 / 1_000_000).toFixed(0)} Jt/bln
          </strong>
        </p>
        <Link href={`/calculator?harga=${listing.price}&from=${encodeURIComponent('/listings/' + listing.slug)}`}
          className="btn-primary w-full justify-center text-sm py-2.5">
          Hitung KPR Sekarang
        </Link>
      </div>

      {/* Share — Copy Link only */}
      <div className="card p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Bagikan</p>
        <button onClick={handleCopyLink}
          className="w-full py-2.5 text-center text-sm font-semibold border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
          🔗 Copy Link
        </button>
      </div>

    </div>
  )
}
