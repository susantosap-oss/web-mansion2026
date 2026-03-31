import { NextResponse } from 'next/server'
import { getAgents, computeAgentScore } from '@/lib/sheets'
import { getScoreWeights } from '@/lib/serverSheets'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [agents, weights] = await Promise.all([getAgents(), getScoreWeights()])

  const top = agents
    .filter(a => a.verified)
    .map(a => ({
      id:       a.id,
      name:     a.name,
      role:     a.role,
      listings: a.totalListings,
      deals:    a.totalDeals,
      hits:     a.hitCount,
      leads:    a.leadsCount,
      logins:   a.loginCount,
      lsp:      !!(a.nomerLsp || a.sertifikasi || a.nomerCra),
      score:    computeAgentScore(a, weights),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 15)

  return NextResponse.json({ weights, top })
}
