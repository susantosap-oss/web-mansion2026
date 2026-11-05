import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getAgentById, getListings, getAgents, formatPrice, computeAgentScore } from '@/lib/sheets'
import { getScoreWeights } from '@/lib/serverSheets'
import { findCleanURLByPrefix } from '@/lib/cleanUrls'
import { ListingCard } from '@/components/property/PropertyCard'
import BackButton from '@/components/ui/BackButton'
import AgentProfileClient from './AgentProfileClient'
import AgentCard from '../AgentCard'

// ISR: cache 5 mnt, fallback ke versi terakhir saat GAS down
export const revalidate = 300
export const dynamicParams = true

interface Props { params: { id: string } }

function roleLabel(role: string | undefined): string {
  const r = (role || '').toLowerCase()
  if (r === 'koordinator' || r === 'coordinator' || r === 'koord') return 'Koordinator'
  if (r === 'business_manager' || r === 'bm' || r === 'businessmanager' || r === 'business manager' || r === 'manager') return 'Business Manager'
  if (r === 'principal') return 'Principal'
  return 'Agen'
}

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mansionpro.id'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = decodeURIComponent(params.id)

  const cleanURL = await findCleanURLByPrefix('agents', id)
  if (cleanURL) {
    return {
      title:       cleanURL.title,
      description: cleanURL.description,
      alternates:  { canonical: `${BASE}/agents/${id}` },
      openGraph:   { title: cleanURL.title, description: cleanURL.description, url: `${BASE}/agents/${id}`, type: 'website' },
    }
  }

  const agent = await getAgentById(params.id)
  if (!agent) return { title: 'Agen Tidak Ditemukan' }

  const siteUrl    = BASE
  const title      = `${agent.name} — Agen Properti Mansion Realty ${agent.city || 'Surabaya'}`
  const description = `${agent.name}, ${roleLabel(agent.role)} properti profesional di ${agent.city || 'Surabaya'} dengan ${agent.totalListings} listing aktif dan ${agent.totalDeals} deal terlaksana. Hubungi sekarang!`

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/agents/${agent.id}` },
    openGraph: {
      title,
      description,
      url:    `${siteUrl}/agents/${agent.id}`,
      type:   'profile',
      images: agent.photo ? [{ url: agent.photo, width: 400, height: 400, alt: agent.name }] : [],
    },
    twitter: {
      card:        'summary',
      title,
      description,
      images:      agent.photo ? [agent.photo] : [],
    },
  }
}

export default async function AgentProfilePage({ params }: Props) {
  const id = decodeURIComponent(params.id)

  // ── CleanURL: halaman daftar agen per kota ────────────────
  const cleanURL = await findCleanURLByPrefix('agents', id)
  if (cleanURL) {
    const [allAgents, weights] = await Promise.all([getAgents(), getScoreWeights()])
    const filtered = cleanURL.city
      ? allAgents.filter(a => a.city && a.city.toLowerCase() === cleanURL.city!.toLowerCase())
      : allAgents

    const waKantor = `https://wa.me/${process.env.NEXT_PUBLIC_WA_OFFICE || '628219880889'}?text=${encodeURIComponent('Halo, saya ingin konsultasi properti.')}`

    const jsonLd = {
      '@context':    'https://schema.org',
      '@type':       'ItemList',
      name:          cleanURL.h1,
      numberOfItems: filtered.length,
      url:           `${BASE}/agents/${id}`,
      itemListElement: filtered.slice(0, 20).map((a, i) => ({
        '@type':   'ListItem',
        position:  i + 1,
        item: {
          '@type':    'Person',
          name:       a.name,
          url:        `${BASE}/agents/${a.id}`,
          image:      a.photo || undefined,
          jobTitle:   `${roleLabel(a.role)} Properti`,
          worksFor:   { '@type': 'Organization', name: 'Mansion Realty' },
          address:    { '@type': 'PostalAddress', addressLocality: a.city || 'Surabaya', addressCountry: 'ID' },
        },
      })),
    }

    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type':    'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Beranda',      item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Agen',         item: `${BASE}/agents` },
        { '@type': 'ListItem', position: 3, name: cleanURL.label, item: `${BASE}/agents/${id}` },
      ],
    }

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}/>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}/>
        <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
          <div className="section-wrapper">
            <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
              <Link href="/" className="hover:text-primary-900">Beranda</Link>
              <span>/</span>
              <Link href="/agents" className="hover:text-primary-900">Agen</Link>
              <span>/</span>
              <span className="text-primary-900 font-medium">{cleanURL.label}</span>
            </nav>
            <div className="mb-8">
              <div className="divider-gold mb-3"/>
              <h1 className="section-title">{cleanURL.h1}</h1>
              <p className="text-gray-500 mt-2">{filtered.length} agen ditemukan</p>
            </div>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((agent, idx) => (
                  <AgentCard key={agent.id} agent={agent} idx={idx} sort="default" waKantor={waKantor}/>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <div className="text-5xl mb-4">👤</div>
                <p>Belum ada agen untuk kota ini.</p>
                <Link href="/agents" className="btn-primary mt-6">Lihat Semua Agen</Link>
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  // ── Profil agen individual ────────────────────────────────
  const [agent, allListings, weights] = await Promise.all([
    getAgentById(params.id),
    getListings(),
    getScoreWeights(),
  ])

  if (!agent) notFound()

  // Listing aktif milik agen (owner atau co-owner)
  const agentListings = allListings
    .filter(l =>
      (l.agentId === agent.id || (l.coOwners || []).some(co => co.id === agent.id))
      && l.status === 'Aktif'
    )

  const siteUrl   = BASE
  const agentUrl  = `${siteUrl}/agents/${agent.id}`
  const waKantor  = `https://wa.me/${process.env.NEXT_PUBLIC_WA_OFFICE || '628219880889'}?text=${encodeURIComponent(`Halo, saya ingin terhubung dengan agen ${agent.name}.`)}`
  const score     = computeAgentScore(agent, weights)
  const convRate  = String(agent.konversiRate ?? 0)

  const PersonSchema = {
    '@context':  'https://schema.org',
    '@type':     'Person',
    name:        agent.name,
    jobTitle:    `${roleLabel(agent.role)} Properti`,
    worksFor:    { '@type': 'Organization', name: 'Mansion Realty' },
    image:       agent.photo || undefined,
    telephone:   agent.phone || undefined,
    address:     { '@type': 'PostalAddress', addressLocality: agent.city || 'Surabaya', addressCountry: 'ID' },
    url:         agentUrl,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PersonSchema) }} />

      <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
        <div className="section-wrapper">
          <BackButton label="Kembali ke Daftar Agen" />

          {/* Profile Card */}
          <div className="card p-6 md:p-8 mb-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Photo */}
              <div className="w-28 h-28 rounded-full overflow-hidden bg-primary-100 flex-shrink-0 flex items-center justify-center border-4 border-white shadow-lg mx-auto sm:mx-0">
                <Image
                  src={agent.photo && agent.photo.trim() !== '' ? agent.photo : '/icons/icon-192x192.png'}
                  alt={agent.name}
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {/* Nama + badge */}
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-primary-900">{agent.name}</h1>
                  {agent.verified && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">✓ Terverifikasi</span>
                  )}
                </div>
                <p className="text-gray-500 mb-3">{roleLabel(agent.role)} · {agent.city || 'Surabaya'}</p>

                {/* Kredensial */}
                {(agent.nomerLsp || agent.sertifikasi || agent.nomerCra) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {agent.nomerLsp  && <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full font-medium">LSP: {agent.nomerLsp}</span>}
                    {agent.sertifikasi && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">Sert: {agent.sertifikasi}</span>}
                    {agent.nomerCra  && <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-medium">CRA: {agent.nomerCra}</span>}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: 'Listing Aktif', value: agentListings.length },
                    { label: 'Total Deal',    value: agent.totalDeals },
                    { label: 'Konversi',      value: `${convRate}%` },
                    { label: 'Skor Agen',     value: score.toLocaleString('id-ID') },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="font-bold text-primary-900 text-lg">{s.value}</div>
                      <div className="text-xs text-gray-400">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Tombol interaktif */}
                <AgentProfileClient agent={agent} agentUrl={agentUrl} waKantor={waKantor} />
              </div>
            </div>
          </div>

          {/* Listing Agen */}
          <div>
            <div className="divider-gold mb-3" />
            <h2 className="section-title mb-1">Listing Properti</h2>
            <p className="text-gray-400 text-sm mb-6">
              {agentListings.length > 0
                ? `${agentListings.length} properti aktif dari ${agent.name}`
                : `Belum ada listing aktif dari ${agent.name}`}
            </p>

            {agentListings.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-3">🏠</div>
                <p>Listing belum tersedia</p>
                <Link href="/listings" className="text-primary-900 text-sm font-semibold mt-3 inline-block hover:underline">
                  Lihat semua listing →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {agentListings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
