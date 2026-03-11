import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminDashboardClient from './AdminDashboardClient'
import { getListings, getAgents, getNews } from '@/lib/sheets'

export default async function AdminDashboardPage() {
  const session = getSession()
  if (!session) redirect('/login')
  if (session.role === 'agent') redirect('/dashboard/agent')
    const [listings, agents, news] = await Promise.all([getListings(), getAgents(), getNews()]);
  return <AdminDashboardClient user={session} stats={{ listings: listings.length, agents: agents.length, news: news.length }} />
}
