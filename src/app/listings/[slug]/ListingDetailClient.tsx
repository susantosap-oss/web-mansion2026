'use client'
import { useState } from 'react'
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
  const [showForm, setShowForm] = useState(false)
  const [name, setName]         = useState('')
  const [phone, setPhone]       = useState('')
  const [sending, setSending]   = useState(false)
  const [sent, setSent]         = useState(false)

  const targetWa = listing.agentPhone ? waLink : waKantor

  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    navigator?.clipboard?.writeText(url)
      .then(() => alert('Link berhasil disalin!'))
  }

  const handleContact = async () => {
    if (!name.trim() || !phone.trim()) return
    setSending(true)
    // Simpan lead ke GSheet sebagai SSoT CRM
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:         name.trim(),
          phone:        phone.trim(),
          listingId:    listing.id,
          listingTitle: listing.title,
          agentId:      listing.agentId,
          message:      `Tertarik properti: ${listing.title} — ${formatPrice(listing.price)}`,
          source:       'Web',
          tipeProperti: listing.propertyType,
          jenis:        listing.type === 'Sale' ? 'Secondary' : 'Sewa',
          minatTipe:    listing.type === 'Sale' ? 'Beli' : 'Sewa',
          lokasi:       [listing.location, listing.city].filter(Boolean).join(', '),
        }),
      })
    } catch { /* tetap lanjut ke WA meski lead gagal disimpan */ }
    setSending(false)
    setSent(true)
    window.open(targetWa, '_blank')
  }

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

        {/* Lead capture form — muncul sebelum buka WA */}
        {!sent ? (
          !showForm ? (
            <button onClick={() => setShowForm(true)}
              className="btn-wa w-full justify-center py-3 mb-3">
              💬 Chat WhatsApp Agen
            </button>
          ) : (
            <div className="space-y-2.5 mb-3">
              <p className="text-xs text-gray-500 font-medium">Masukkan data Anda agar agen bisa follow-up:</p>
              <input
                className="input-field text-sm py-2"
                placeholder="Nama Lengkap *"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
              <input
                className="input-field text-sm py-2"
                placeholder="No. WhatsApp *"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
              <button
                onClick={handleContact}
                disabled={sending || !name.trim() || !phone.trim()}
                className="btn-wa w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                {sending ? 'Menyimpan...' : '💬 Lanjut ke WhatsApp'}
              </button>
              <button onClick={() => setShowForm(false)}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 py-1">
                Batal
              </button>
            </div>
          )
        ) : (
          <div className="text-center py-2 mb-3">
            <p className="text-sm text-green-600 font-semibold">✅ Data tersimpan!</p>
            <button onClick={() => window.open(targetWa, '_blank')}
              className="btn-wa w-full justify-center py-3 mt-2">
              💬 Buka WhatsApp Lagi
            </button>
          </div>
        )}

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

      {/* Share */}
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
