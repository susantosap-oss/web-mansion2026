import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AgentDashboardClient from './AgentDashboardClient'

export default async function AgentDashboardPage() {
  const session = getSession()
  if (!session) redirect('/login')
  if (session.role === 'admin' || session.role === 'superadmin') redirect('/dashboard/admin')

  return <AgentDashboardClient user={session} />
}
