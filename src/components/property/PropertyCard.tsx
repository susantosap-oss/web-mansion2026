'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Listing, Project } from '@/types'
import { formatPrice, buildWALink } from '@/lib/sheets'

// ── Mini lead-capture modal ────────────────────────────────
function WaLeadButton({ waHref, agentId, listingId, listingTitle, agentName, tipeProperti, jenis, minatTipe, lokasi, price }: {
  waHref: string; agentId: string; listingId: string; listingTitle: string
  agentName: string; tipeProperti: string; jenis: string; minatTipe: string
  lokasi: string; price: number
}) {
  const [show,    setShow]    = useState(false)
  const [name,    setName]    = useState('')
  const [phone,   setPhone]   = useState('')
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)

  const handleContact = async () => {
    if (!name.trim() || !phone.trim()) return
    setSending(true)
    try {
      await fetch('/api/leads', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:         name.trim(),
          phone:        phone.trim(),
          agentId,
          listingId,
          listingTitle,
          message:      `Tertarik properti: ${listingTitle}`,
          source:       'Web',
          tipeProperti,
          jenis,
          minatTipe,
          lokasi,
        }),
      })
    } catch { /* tetap buka WA */ }
    setSending(false)
    setSent(true)
    window.open(waHref, '_blank')
  }

  if (sent) {
    return (
      <button onClick={() => window.open(waHref, '_blank')}
        className="flex-1 text-center py-2 text-sm font-semibold text-white bg-[#0f7266] rounded-lg hover:bg-[#0e6b5e] transition-colors">
        💬 WA Agen
      </button>
    )
  }

  if (!show) {
    return (
      <button onClick={() => setShow(true)}
        className="flex-1 text-center py-2 text-sm font-semibold text-white bg-[#0f7266] rounded-lg hover:bg-[#0e6b5e] transition-colors">
        💬 WA Agen
      </button>
    )
  }

  return (
    <div className="w-full space-y-1.5 mt-1">
      <p className="text-xs text-gray-500 font-medium">Data Anda untuk follow-up:</p>
      <input
        className="input-field text-xs py-1.5"
        placeholder="Nama Lengkap *"
        value={name}
        onChange={e => setName(e.target.value)}
        autoFocus
      />
      <input
        className="input-field text-xs py-1.5"
        placeholder="No. WhatsApp *"
        type="tel"
        value={phone}
        onChange={e => setPhone(e.target.value)}
      />
      <div className="flex gap-1.5">
        <button
          onClick={handleContact}
          disabled={sending || !name.trim() || !phone.trim()}
          className="flex-1 py-1.5 text-xs font-semibold text-white bg-[#0f7266] rounded-lg hover:bg-[#0e6b5e] disabled:opacity-50 transition-colors">
          {sending ? '...' : '💬 WA'}
        </button>
        <button onClick={() => setShow(false)}
          className="px-3 py-1.5 text-xs text-gray-400 border border-gray-200 rounded-lg hover:bg-gray-50">
          ✕
        </button>
      </div>
    </div>
  )
}

// ── Listing Card ───────────────────────────────────────────
export function ListingCard({ listing, className = '', priority = false }: { listing: Listing; className?: string; priority?: boolean }) {
  const wa = buildWALink(
    listing.agentPhone,
    `Halo ${listing.agentName}, saya tertarik dengan: ${listing.title}. Info lebih lanjut?`
  )
  return (
    <div className={`card group property-card ${className}`}>
      <div className="relative h-52 overflow-hidden">
        {listing.coverImage ? (
          <Image src={listing.coverImage} alt={listing.title} fill className="object-cover property-image" sizes="(max-width: 768px) 100vw, 33vw" priority={priority}/>
        ) : (
          <div className="w-full h-full bg-primary-100 flex items-center justify-center"><span className="text-4xl">🏠</span></div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={listing.type === 'Sale' ? 'badge-sale' : 'badge-rent'}>{listing.type === 'Sale' ? 'Dijual' : 'Disewa'}</span>
          {listing.featured && <span className="badge-new">⭐ Unggulan</span>}
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-600 mb-1">📍 {listing.location}, {listing.city}</p>
        <Link href={`/listings/${listing.slug}`}>
          <h3 className="font-display font-semibold text-primary-900 hover:text-primary-700 transition-colors line-clamp-2 mb-2 leading-snug">{listing.title}</h3>
        </Link>
        <p className="price-display mb-3">{formatPrice(listing.price)}</p>
        <div className="flex gap-3 text-xs text-gray-600 border-t border-gray-100 pt-3 mb-3">
          {listing.luasTanah > 0 && <span>🏠 {listing.luasTanah}m²</span>}
          {listing.luasBangunan > 0 && <span>📐 {listing.luasBangunan}m²</span>}
          {listing.kamarTidur > 0 && <span>🛏 {listing.kamarTidur}</span>}
          {listing.kamarMandi > 0 && <span>🚿 {listing.kamarMandi}</span>}
        </div>
        <div className="flex gap-2">
          <Link href={`/listings/${listing.slug}`} className="flex-1 text-center py-2 text-sm font-semibold text-primary-900 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">Detail</Link>
          <WaLeadButton
            waHref={wa}
            agentId={listing.agentId}
            listingId={listing.id}
            listingTitle={listing.title}
            agentName={listing.agentName || ''}
            tipeProperti={listing.propertyType}
            jenis={listing.type === 'Sale' ? 'Secondary' : 'Sewa'}
            minatTipe={listing.type === 'Sale' ? 'Beli' : 'Sewa'}
            lokasi={[listing.location, listing.city].filter(Boolean).join(', ')}
            price={listing.price}
          />
        </div>
      </div>
    </div>
  )
}

// ── Project Card ───────────────────────────────────────────
export function ProjectCard({ project, className = '', priority = false }: { project: Project; className?: string; priority?: boolean }) {
  return (
    <div className={`card group property-card ${className}`}>
      <div className="relative h-52 overflow-hidden">
        {project.coverImage ? (
          <Image src={project.coverImage} alt={project.name} fill className="object-cover property-image" sizes="(max-width: 768px) 100vw, 33vw" priority={priority}/>
        ) : (
          <div className="w-full h-full bg-primary-900 flex items-center justify-center"><span className="text-4xl">🏗</span></div>
        )}
        <div className="absolute top-3 left-3">
          <span className="badge bg-primary-900 text-white">{project.type}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <p className="text-white/70 text-xs">Developer</p>
          <p className="text-white font-semibold text-sm">{project.developer}</p>
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-600 mb-1">📍 {project.location}, {project.city}</p>
        <Link href={`/projects/${project.slug}`}>
          <h3 className="font-display font-semibold text-primary-900 hover:text-primary-700 transition-colors leading-snug mb-2">{project.name}</h3>
        </Link>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{project.description}</p>
        <div className="bg-primary-50 rounded-lg p-2.5 mb-3">
          <p className="text-xs text-gray-700">Mulai dari</p>
          <p className="price-display text-lg">{formatPrice(project.priceMin)}</p>
        </div>
        <Link href={`/projects/${project.slug}`} className="block w-full text-center btn-primary py-2.5 text-sm" aria-label={`Lihat Detail Proyek ${project.name}`}>Lihat Detail Proyek</Link>
      </div>
    </div>
  )
}
