'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Listing } from '@/types'
import { formatPrice } from '@/lib/sheets'

interface Props {
  listing: Listing
  waKantor: string
}

// Build WA link client-side (sama seperti buildWALink di sheets.ts)
function makeWaLink(phone: string, message: string): string {
  const officeWa = process.env.NEXT_PUBLIC_WA_OFFICE || '6281234567890'
  if (!phone) return `https://wa.me/${officeWa}?text=${encodeURIComponent(message)}`
  const clean      = phone.replace(/\D/g, '')
  const normalized = clean.startsWith('0') ? '62' + clean.slice(1) : clean.startsWith('62') ? clean : '62' + clean
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}

type Step = 'idle' | 'form' | 'pick' | 'sent'

export default function ListingDetailClient({ listing, waKantor }: Props) {
  // waLink dihapus — WA link dibangun per agen saat user memilih (makeWaLink)
  const [step, setStep]       = useState<Step>('idle')
  const [name, setName]       = useState('')
  const [phone, setPhone]     = useState('')
  const [sending, setSending] = useState(false)
  // Agen yang dipilih user setelah form diisi
  const [pickedAgent, setPickedAgent] = useState<{ id: string; name: string; phone: string } | null>(null)

  const waMessage = `Halo, saya tertarik dengan properti:\n*${listing.title}*\nHarga: ${formatPrice(listing.price)}\n\nBisa info lebih lanjut?`

  // Daftar semua agen: Owner (no.1) + Co-Owns
  const ownerName = listing.agentName && !listing.agentName.startsWith('[') ? listing.agentName : 'Agen Mansion Realty'
  const allAgents = [
    { id: listing.agentId, name: ownerName, phone: listing.agentPhone, photo: listing.agentPhoto },
    ...(listing.coOwners || []),
  ]
  const hasMultiple = allAgents.length > 1

  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    navigator?.clipboard?.writeText(url).then(() => alert('Link berhasil disalin!'))
  }

  // Setelah form diisi: jika 1 agen → langsung simpan lead + buka WA
  // Jika >1 agen → tampilkan picker dulu, lead disimpan saat user pilih
  const handleFormSubmit = () => {
    if (!name.trim() || !phone.trim()) return
    if (hasMultiple) {
      setStep('pick')
    } else {
      handlePickAgent(allAgents[0])
    }
  }

  // Simpan lead ke CRM dengan agentId = agen yang dipilih user, lalu buka WA
  const handlePickAgent = async (ag: typeof allAgents[0]) => {
    setPickedAgent(ag)
    setSending(true)
    try {
      await fetch('/api/leads', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:         name.trim(),
          phone:        phone.trim(),
          listingId:    listing.id,
          listingTitle: listing.title,
          agentId:      ag.id,
          message:      `Tertarik properti: ${listing.title} — ${formatPrice(listing.price)}`,
          source:       'Web',
          tipeProperti: listing.propertyType,
          jenis:        listing.type === 'Sale' ? 'Secondary' : 'Sewa',
          minatTipe:    listing.type === 'Sale' ? 'Beli' : 'Sewa',
          lokasi:       [listing.location, listing.city].filter(Boolean).join(', '),
        }),
      })
    } catch { /* tetap buka WA meski lead gagal */ }
    setSending(false)
    const waUrl = ag.phone ? makeWaLink(ag.phone, waMessage) : waKantor
    window.open(waUrl, '_blank')
    setStep('sent')
  }

  return (
    <div className="sticky top-24 space-y-4">

      {/* Agent Card */}
      <div className="card p-5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Hubungi Agen</h3>

        {/* Daftar agen: Owner (no.1) lalu Co-Own */}
        <div className="space-y-3 mb-4 pb-4 border-b border-gray-100">
          {allAgents.map((ag, idx) => (
            <div key={ag.id || idx} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-primary-100 flex-shrink-0 flex items-center justify-center">
                {ag.photo ? (
                  <Image src={ag.photo} alt={ag.name} width={44} height={44} className="object-cover w-full h-full"/>
                ) : (
                  <span className="text-primary-900 font-bold text-base">{(ag.name || 'A').charAt(0)}</span>
                )}
              </div>
              <div>
                <p className="font-semibold text-primary-900 text-sm">{ag.name}</p>
                {ag.phone && <p className="text-xs text-gray-400 mt-0.5">📱 {ag.phone}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Step: idle → tombol utama */}
        {step === 'idle' && (
          <button onClick={() => setStep('form')}
            className="btn-wa w-full justify-center py-3 mb-3">
            💬 Chat WhatsApp Agen
          </button>
        )}

        {/* Step: form → isi nama & no WA */}
        {step === 'form' && (
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
              onClick={handleFormSubmit}
              disabled={sending || !name.trim() || !phone.trim()}
              className="btn-wa w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed">
              {sending ? 'Menyimpan...' : hasMultiple ? 'Lanjut Pilih Agen →' : '💬 Lanjut ke WhatsApp'}
            </button>
            <button onClick={() => setStep('idle')}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-600 py-1">
              Batal
            </button>
          </div>
        )}

        {/* Step: pick → pilih agen */}
        {step === 'pick' && (
          <div className="space-y-2 mb-3">
            <p className="text-xs text-gray-500 font-medium">Pilih agen yang ingin Anda hubungi:</p>
            {allAgents.map((ag, idx) => (
              <button
                key={ag.id || idx}
                onClick={() => handlePickAgent(ag)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#128C7E] hover:bg-[#f0faf8] transition-colors text-left">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-primary-100 flex-shrink-0 flex items-center justify-center">
                  {ag.photo ? (
                    <Image src={ag.photo} alt={ag.name} width={36} height={36} className="object-cover w-full h-full"/>
                  ) : (
                    <span className="text-primary-900 font-bold text-sm">{(ag.name || 'A').charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-primary-900 text-sm truncate">{ag.name}</p>
                </div>
                <span className="text-[#128C7E] text-xs font-semibold flex-shrink-0">💬 WA</span>
              </button>
            ))}
            <button onClick={() => setStep('form')}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-600 py-1">
              ← Kembali
            </button>
          </div>
        )}

        {/* Step: sent → selesai */}
        {step === 'sent' && (
          <div className="space-y-2 mb-3">
            <div className="text-center py-1">
              <p className="text-sm text-green-600 font-semibold">✅ Data tersimpan!</p>
              {pickedAgent && <p className="text-xs text-gray-400 mt-1">Terhubung ke {pickedAgent.name}</p>}
            </div>
            {/* Tampilkan ulang semua pilihan untuk buka WA lagi */}
            {allAgents.map((ag, idx) => (
              <button
                key={ag.id || idx}
                onClick={() => window.open(ag.phone ? makeWaLink(ag.phone, waMessage) : waKantor, '_blank')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-[#f0faf8] border border-[#128C7E]/20 hover:bg-[#e0f5f0] transition-colors text-left">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 flex-shrink-0 flex items-center justify-center">
                  {ag.photo ? (
                    <Image src={ag.photo} alt={ag.name} width={32} height={32} className="object-cover w-full h-full"/>
                  ) : (
                    <span className="text-primary-900 font-bold text-xs">{(ag.name || 'A').charAt(0)}</span>
                  )}
                </div>
                <p className="font-semibold text-primary-900 text-sm flex-1 truncate">{ag.name}</p>
                <span className="text-[#128C7E] text-xs font-semibold flex-shrink-0">💬 WA</span>
              </button>
            ))}
          </div>
        )}

        <Link href="/agents"
          className="block text-center text-xs text-gray-400 hover:text-primary-900 transition-colors mt-1">
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
