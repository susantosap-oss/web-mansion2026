import { getAgents } from '@/lib/sheets'
import Link from 'next/link'
import AgentCard from './AgentCard'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: { sort?: string }
}

export default async function AgentsPage({ searchParams }: Props) {
  const sort   = searchParams.sort || 'default'
  let   agents = await getAgents()

  // Sort by conversion rate (deal / listing)
  if (sort === 'conversion') {
    agents = [...agents].sort((a, b) => {
      const rateA = a.totalListings > 0 ? a.totalDeals / a.totalListings : 0
      const rateB = b.totalListings > 0 ? b.totalDeals / b.totalListings : 0
      return rateB - rateA
    }).slice(0, 10) // top 10
  }

  const waKantor = `https://wa.me/${process.env.NEXT_PUBLIC_WA_OFFICE || '628219880889'}?text=${encodeURIComponent('Halo, saya ingin konsultasi properti.')}`

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
            {agents.map((agent, idx) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                idx={idx}
                sort={sort}
                waKantor={waKantor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
