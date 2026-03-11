import { getAgents } from '@/lib/sheets'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: { sort?: string }
}

export default async function AgentsPage({ searchParams }: Props) {
  const sort    = searchParams.sort || 'default'
  let   agents  = await getAgents()

  // Sort by conversion rate (deal / listing)
  if (sort === 'conversion') {
    agents = [...agents].sort((a, b) => {
      const rateA = a.totalListings > 0 ? a.totalDeals / a.totalListings : 0
      const rateB = b.totalListings > 0 ? b.totalDeals / b.totalListings : 0
      return rateB - rateA
    }).slice(0, 10) // top 10
  }

  const wa = process.env.NEXT_PUBLIC_WA_OFFICE || '6281234567890'

  return (
    <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
      <div className="section-wrapper">
        <div className="mb-8">
          <div className="divider-gold mb-3"/>
          <h1 className="section-title">
            {sort === 'conversion' ? '🏆 Agen Terbaik' : 'Tim Agen Kami'}
          </h1>
          <p className="text-gray-400 mt-1">
            {sort === 'conversion'
              ? 'Top 10 agen dengan tingkat konversi tertinggi'
              : `${agents.length} agen profesional siap membantu Anda`}
          </p>
        </div>

        {/* Sort tabs */}
        <div className="flex gap-2 mb-6">
          <Link href="/agents"
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${sort === 'default' ? 'bg-primary-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
            Semua Agen
          </Link>
          <Link href="/agents?sort=conversion"
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${sort === 'conversion' ? 'bg-primary-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
            🏆 Top Konversi
          </Link>
        </div>

        {agents.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">👤</div>
            <p>Data agen belum tersedia</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {agents.map((agent, idx) => {
              const convRate = agent.totalListings > 0
                ? ((agent.totalDeals / agent.totalListings) * 100).toFixed(0)
                : '0'
              const waMsg  = `Halo ${agent.name}, saya ingin konsultasi properti.`
              const waLink = `https://wa.me/${(agent.whatsapp || agent.phone || '').replace(/\D/g,'')}?text=${encodeURIComponent(waMsg)}`

              return (
                <div key={agent.id} className="card p-5 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                  {/* Rank badge untuk top conversion */}
                  {sort === 'conversion' && (
                    <div className="flex justify-end mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                        idx === 1 ? 'bg-gray-100 text-gray-600' :
                        idx === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx+1}`}
                      </span>
                    </div>
                  )}

                  {/* Photo */}
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center mb-3 border-4 border-white shadow-md">
                      {agent.photo ? (
                        <Image src={agent.photo} alt={agent.name} width={80} height={80} className="object-cover w-full h-full"/>
                      ) : (
                        <span className="text-primary-900 font-bold text-2xl">{agent.name.charAt(0)}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-primary-900">{agent.name}</h3>
                    <p className="text-xs text-gray-400">{agent.bio || 'Agen Properti'}</p>
                    {agent.verified && (
                      <span className="mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                        ✓ Terverifikasi
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label:'Listing', value: agent.totalListings },
                      { label:'Deal',    value: agent.totalDeals },
                      { label:'Konversi',value: `${convRate}%` },
                    ].map(s => (
                      <div key={s.label} className="bg-gray-50 rounded-xl p-2 text-center">
                        <div className="font-bold text-primary-900 text-sm">{s.value}</div>
                        <div className="text-xs text-gray-400">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* WA Button */}
                  <a href={(agent.phone || agent.whatsapp) ? waLink : `https://wa.me/${wa}?text=${encodeURIComponent(waMsg)}`}
                     target="_blank" rel="noopener noreferrer"
                     className="btn-wa w-full justify-center py-2.5 text-sm">
                    💬 Hubungi via WA
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
