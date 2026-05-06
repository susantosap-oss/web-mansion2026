import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getAgentById, getListings, formatPrice, computeAgentScore } from '@/lib/sheets'
import { getScoreWeights } from '@/lib/serverSheets'
import { ListingCard } from '@/components/property/PropertyCard'
import BackButton from '@/components/ui/BackButton'
import AgentProfileClient from './AgentProfileClient'

export const dynamic = 'force-dynamic'

interface Props { params: { id: string } }

function roleLabel(role: string | undefined): string {
  const r = (role || '').toLowerCase()
  if (r === 'koordinator' || r === 'coordinator' || r === 'koord') return 'Koordinator'
  if (r === 'business_manager' || r === 'bm' || r === 'businessmanager' || r === 'business manager' || r === 'manager') return 'Business Manager'
  if (r === 'principal') return 'Principal'
  return 'Agen'
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const agent = await getAgentById(params.id)
  if (!agent) return { title: 'Agen Tidak Ditemukan' }

  const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mansionpro.id'
  const title      = `${agent.name} — Agen Properti Mansion Realty ${agent.city || 'Surabaya'}`
  const description = `${agent.name}, ${roleLabel(agent.role)} properti profesional di ${agent.city || 'Surabaya'} dengan ${agent.totalListings} listing aktif dan ${agent.totalDeals} deal terlaksana. Hubungi sekarang!`

  return {
    title,
    description,
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

  const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mansionpro.id'
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
