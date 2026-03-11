import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminDashboardClient from './AdminDashboardClient'

export default async function AdminDashboardPage() {
  const session = getSession()
  if (!session) redirect('/login')
  if (session.role === 'agent') redirect('/dashboard/agent')
  return <AdminDashboardClient user={session} />
}
