import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AgentDashboardClient from './AgentDashboardClient'
import { getListings } from '@/lib/sheets'

export default async function AgentDashboardPage() {
  const session = getSession()
  if (!session) redirect('/login')
  if (session.role === 'admin' || session.role === 'superadmin') redirect('/dashboard/admin')

    const listings = await getListings();
  return <AgentDashboardClient user={session} stats={{ listings: listings.length }} />
}
