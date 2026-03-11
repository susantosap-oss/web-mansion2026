'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthUser } from '@/lib/auth'

interface Props { user: AuthUser, stats: { listings: number } }

export default function AgentDashboardClient({ user, stats }: Props) {
  const router  = useRouter()
  const [tab, setTab]       = useState<'leads' | 'pipeline' | 'listings'>('leads')
  const [leads, setLeads]   = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [leadsRes, listingsRes] = await Promise.all([
        fetch(`/api/leads?agentId=${user.agentId}`),
        fetch(`/api/sheets?action=getListings`),
      ])
      const leadsJson    = await leadsRes.json()
      const listingsJson = await listingsRes.json()

      setLeads(leadsJson.data || [])

      // Filter listing milik agen ini
      const myListings = (listingsJson.data || []).filter((l: any) =>
        String(l['Agen_ID'] || '') === String(user.agentId || '')
      )
      setListings(myListings)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/login')
  }

  const totalViews = listings.reduce((sum: number, l: any) => sum + (Number(l['Views_Count']) || 0), 0)
  const newLeads   = leads.filter((l: any) => l['STATUS'] === 'New' || l['status'] === 'New').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-900 text-white sticky top-0 z-40">
        <div className="section-wrapper py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
                <span className="text-primary-900 font-bold">M</span>
              </div>
              <span className="font-display font-bold hidden sm:block">MANSION Realty</span>
            </Link>
            <span className="text-white/30 hidden sm:block">|</span>
            <span className="text-white/70 text-sm hidden sm:block">Dashboard MANSION Agent</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-white/50 capitalize">{user.role}</p>
            </div>
            <button onClick={handleLogout} className="text-xs px-3 py-1.5 border border-white/20 rounded-lg hover:bg-white/10 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="section-wrapper py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: '🏠', label: 'Total Listing', value: listings.length, color: 'bg-blue-50 text-blue-700' },
            { icon: '👁',  label: 'Total Views',   value: totalViews,      color: 'bg-green-50 text-green-700' },
            { icon: '📩', label: 'Total Leads',   value: leads.length,    color: 'bg-purple-50 text-purple-700' },
            { icon: '🔔', label: 'Lead Baru',     value: newLeads,        color: 'bg-amber-50 text-amber-700' },
          ].map(stat => (
            <div key={stat.label} className={`rounded-2xl p-5 ${stat.color} border border-current/10`}>
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-display font-bold">{loading ? '...' : stat.value}</div>
              <div className="text-sm font-medium mt-1 opacity-70">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="flex border-b border-gray-100">
            {[
              { id: 'leads',    label: '📩 Menu Leads',    badge: newLeads },
              { id: 'pipeline', label: '📊 Pipeline',      badge: 0 },
              { id: 'listings', label: '🏠 Listing Saya',  badge: listings.length },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${tab === t.id ? 'text-primary-900 border-b-2 border-primary-900 bg-primary-50' : 'text-gray-400 hover:text-gray-600'}`}>
                {t.label}
                {t.badge > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full">
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-3 animate-bounce">⏳</div>
                <p>Memuat data...</p>
              </div>
            ) : (

              /* ── LEADS TAB ── */
              tab === 'leads' ? (
                leads.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-5xl mb-3">📭</div>
                    <p>Belum ada lead masuk</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leads.map((lead: any, i: number) => (
                      <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-900 font-bold flex-shrink-0">
                          {String(lead['NAMA'] || lead['nama'] || lead['name'] || 'U').charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-primary-900">{lead['NAMA'] || lead['nama'] || lead['name'] || '-'}</p>
                          <p className="text-sm text-gray-500">{lead['TELEPON'] || lead['phone'] || '-'}</p>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{lead['PESAN'] || lead['message'] || '-'}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className={`badge text-xs ${
                            (lead['STATUS'] || lead['status']) === 'New' ? 'bg-red-100 text-red-700' :
                            (lead['STATUS'] || lead['status']) === 'Contacted' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {lead['STATUS'] || lead['status'] || 'New'}
                          </span>
                          <p className="text-xs text-gray-400 mt-1">{lead['TANGGAL'] || lead['created_at'] || ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )

              /* ── PIPELINE TAB ── */
              ) : tab === 'pipeline' ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-400 mb-4">Performa listing Anda</p>
                  {listings.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <div className="text-5xl mb-3">📊</div>
                      <p>Belum ada listing</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-primary-900 text-white">
                          <tr>
                            <th className="px-4 py-3 text-left rounded-l-lg">Listing</th>
                            <th className="px-4 py-3 text-center">Views</th>
                            <th className="px-4 py-3 text-center">Leads</th>
                            <th className="px-4 py-3 text-center rounded-r-lg">Konversi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {listings.map((l: any, i: number) => {
                            const views    = Number(l['Views_Count']) || 0
                            const myLeads  = leads.filter((ld: any) => ld['LISTING_ID'] === l['ID']).length
                            const konversi = views > 0 ? ((myLeads / views) * 100).toFixed(1) : '0'
                            return (
                              <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="px-4 py-3">
                                  <p className="font-semibold text-primary-900 line-clamp-1">{l['Judul'] || '-'}</p>
                                  <p className="text-xs text-gray-400">{l['Kota'] || ''}</p>
                                </td>
                                <td className="px-4 py-3 text-center font-semibold">{views}</td>
                                <td className="px-4 py-3 text-center font-semibold text-purple-700">{myLeads}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`badge ${Number(konversi) > 5 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {konversi}%
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              /* ── LISTINGS TAB ── */
              ) : (
                listings.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-5xl mb-3">🏠</div>
                    <p>Belum ada listing yang ditugaskan</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {listings.map((l: any, i: number) => (
                      <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-primary-200 transition-colors">
                        <div className="flex gap-3">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {l['Foto_Utama_URL'] ? (
                              <img src={l['Foto_Utama_URL']} alt={l['Judul']} className="w-full h-full object-cover"/>
                            ) : <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-primary-900 text-sm line-clamp-2">{l['Judul'] || '-'}</p>
                            <p className="text-xs text-gray-400">{l['Kota'] || ''}</p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-xs text-gray-500">👁 {l['Views_Count'] || 0}</span>
                              <span className={`badge text-xs ${l['Status_Listing'] === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {l['Status_Listing'] || 'Aktif'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
