import { getAgents, computeAgentScore } from '@/lib/sheets'
import { getScoreWeights } from '@/lib/serverSheets'
import Link from 'next/link'
import AgentCard from './AgentCard'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: { sort?: string }
}

export default async function AgentsPage({ searchParams }: Props) {
  const sort    = searchParams.sort || 'default'
  let   agents  = await getAgents()
  const weights = await getScoreWeights()

  // Top Agen — tiered selection, max 10
  if (sort === 'top') {
    const byScore = [...agents].sort((a, b) => computeAgentScore(b, weights) - computeAgentScore(a, weights))
    const selected: typeof agents = []
    const seen = new Set<string>()
    const fill = (pool: typeof agents) => {
      for (const a of pool) {
        if (selected.length >= 10) break
        if (!seen.has(a.id)) { selected.push(a); seen.add(a.id) }
      }
    }
    // Tier 1: ada konversi (> 0%)
    fill(byScore.filter(a => (a.konversiRate ?? 0) > 0))
    // Tier 2: punya sertifikasi
    fill(byScore.filter(a => !!(a.nomerLsp || a.sertifikasi || a.nomerCra)))
    // Tier 3: punya listing
    fill(byScore.filter(a => a.totalListings > 0))
    // Tier 4: Principal / Koordinator / BM
    fill(byScore.filter(a => {
      const r = (a.role || '').toLowerCase()
      return r === 'principal' || r === 'koordinator' || r === 'coordinator' || r === 'koord'
          || r === 'business_manager' || r === 'bm' || r === 'businessmanager'
          || r === 'business manager' || r === 'manager'
    }))
    agents = selected
  }

  // Agen tanpa foto profile selalu tampil di bawah
  const hasPhoto    = agents.filter(a => a.photo && a.photo.trim() !== '')
  const noPhoto     = agents.filter(a => !a.photo || a.photo.trim() === '')
  agents = [...hasPhoto, ...noPhoto]

  const waKantor = `https://wa.me/${process.env.NEXT_PUBLIC_WA_OFFICE || '628219880889'}?text=${encodeURIComponent('Halo, saya ingin konsultasi properti.')}`

  return (
    <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
      <div className="section-wrapper">
        <div className="mb-8">
          <div className="divider-gold mb-3"/>
          <h1 className="section-title">
            {sort === 'top' ? '🏆 Top 10 Agen Terbaik' : 'Tim Agen Kami'}
          </h1>
          <p className="text-gray-400 mt-1">
            {sort === 'top'
              ? 'Agen Terbaik berdasarkan Konversi, Sertifikasi, Listing dan Aktifitas'
              : `${agents.length} agen profesional siap membantu Anda`}
          </p>
        </div>

        {/* Sort tabs */}
        <div className="flex gap-2 mb-6">
          <Link href="/agents"
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${sort === 'default' ? 'bg-primary-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
            Semua Agen
          </Link>
          <Link href="/agents?sort=top"
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${sort === 'top' ? 'bg-primary-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
            🏆 Top Agen
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
                sort={sort === 'top' ? 'top' : 'default'}
                waKantor={waKantor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
