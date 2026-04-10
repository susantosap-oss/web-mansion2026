'use client'
import LogoBadge from '@/components/ui/LogoBadge'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthUser } from '@/lib/auth'

interface Props { user: AuthUser, stats: { listings: number } }

interface ListingStat {
  views7d:   number
  views30d:  number
  shares7d:  number
  shares30d: number
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mansionpro.id'

export default function AgentDashboardClient({ user, stats }: Props) {
  const router  = useRouter()
  const [tab, setTab]               = useState<'leads' | 'pipeline' | 'listings'>('leads')
  const [leads, setLeads]           = useState<any[]>([])
  const [listings, setListings]     = useState<any[]>([])
  const [listingStats, setListingStats] = useState<Record<string, ListingStat>>({})
  const [loading, setLoading]       = useState(true)
  const [copied, setCopied]         = useState(false)

  useEffect(() => { fetchData() }, [])

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

      // Fetch listing event stats
      if (myListings.length > 0) {
        const ids = myListings.map((l: any) => l['ID']).filter(Boolean).join(',')
        const statsRes  = await fetch(`/api/listing-events?listingIds=${ids}`)
        const statsJson = await statsRes.json()
        setListingStats(statsJson.data || {})
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleShareListing(listingId: string) {
    // Track share from CRM
    fetch('/api/listing-events', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ listingId, type: 'share', source: 'crm' }),
    }).catch(() => {})
  }

  async function handleCopyProfileUrl() {
    const url = `${SITE_URL}/agents/${user.agentId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      prompt('Copy URL profil Anda:', url)
    }
  }

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/login')
  }

  async function handleUpdateStatus(leadId: string, status: string) {
    try {
      await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status }),
      })
      setLeads(prev => prev.map((l: any) =>
        (l['ID'] || l['id']) === leadId ? { ...l, Status_Lead: status, STATUS: status } : l
      ))
    } catch { /* silent */ }
  }

  const totalViews = listings.reduce((sum: number, l: any) => sum + (Number(l['Views_Count']) || 0), 0)
  const newLeads   = leads.filter((l: any) =>
    ['Baru', 'New', 'new', 'baru'].includes(String(l['Status_Lead'] || l['STATUS'] || l['status'] || ''))
  ).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-900 text-white sticky top-0 z-40">
        <div className="section-wrapper py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <LogoBadge size="sm" dark={true} />
              <span className="font-display font-bold hidden sm:block">MANSION Realty</span>
            </Link>
            <span className="text-white/30 hidden sm:block">|</span>
            <span className="text-white/70 text-sm hidden sm:block">Dashboard MANSION Agent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-white/50 capitalize">{user.role}</p>
            </div>
            <Link href={`${SITE_URL}/agents/${user.agentId}`} target="_blank"
              className="text-xs px-3 py-1.5 border border-white/20 rounded-lg hover:bg-white/10 transition-colors hidden sm:inline-flex items-center gap-1">
              👤 Profil
            </Link>
            <button onClick={handleCopyProfileUrl}
              className="text-xs px-3 py-1.5 border border-white/20 rounded-lg hover:bg-white/10 transition-colors">
              {copied ? '✅ Disalin!' : '🔗 Share Profil'}
            </button>
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
                        <div className="text-right flex-shrink-0 space-y-1">
                          {(() => {
                            const st = lead['Status_Lead'] || lead['STATUS'] || lead['status'] || 'Baru'
                            const color =
                              st === 'Baru'      ? 'bg-red-100 text-red-700' :
                              st === 'Dihubungi' ? 'bg-blue-100 text-blue-700' :
                              st === 'Warm'      ? 'bg-orange-100 text-orange-700' :
                              st === 'Qualified' ? 'bg-purple-100 text-purple-700' :
                              st === 'Closing'   ? 'bg-green-100 text-green-700' :
                              st === 'Batal'     ? 'bg-gray-100 text-gray-500' :
                              'bg-gray-100 text-gray-600'
                            return <span className={`badge text-xs ${color}`}>{st}</span>
                          })()}
                          <select
                            className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white text-gray-600 cursor-pointer block ml-auto"
                            value={lead['Status_Lead'] || lead['STATUS'] || lead['status'] || 'Baru'}
                            onChange={e => handleUpdateStatus(lead['ID'] || lead['id'], e.target.value)}
                          >
                            {['Baru','Dihubungi','Warm','Qualified','Closing','Batal'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-400">{lead['Tanggal'] || lead['TANGGAL'] || lead['created_at'] || ''}</p>
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
                            <th className="px-4 py-3 text-center">Leads 30h</th>
                            <th className="px-4 py-3 text-center">Share</th>
                            <th className="px-4 py-3 text-center rounded-r-lg">Konversi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {listings.map((l: any, i: number) => {
                            const lid      = l['ID'] || ''
                            const st       = listingStats[lid] || { views7d: 0, views30d: 0, shares7d: 0, shares30d: 0 }
                            const now30    = Date.now() - 30 * 24 * 60 * 60 * 1000
                            const myLeads  = leads.filter((ld: any) => {
                              if ((ld['LISTING_ID'] || ld['listing_id'] || '') !== lid) return false
                              const tgl = ld['Tanggal'] || ld['TANGGAL'] || ld['created_at'] || ''
                              return !tgl || new Date(tgl).getTime() >= now30
                            }).length
                            const konversi = st.views30d > 0 ? ((myLeads / st.views30d) * 100).toFixed(1) : '0'
                            return (
                              <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="px-4 py-3">
                                  <p className="font-semibold text-primary-900 line-clamp-1">{l['Judul'] || '-'}</p>
                                  <p className="text-xs text-gray-400">{l['Kota'] || ''}</p>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <div className="font-semibold text-blue-700">{st.views7d}<span className="text-xs text-gray-400 font-normal ml-0.5">7h</span></div>
                                  <div className="text-xs text-gray-500">{st.views30d} /30h</div>
                                </td>
                                <td className="px-4 py-3 text-center font-semibold text-purple-700">{myLeads}</td>
                                <td className="px-4 py-3 text-center">
                                  <div className="font-semibold text-green-700">{st.shares7d}<span className="text-xs text-gray-400 font-normal ml-0.5">7h</span></div>
                                  <div className="text-xs text-gray-500">{st.shares30d} /30h</div>
                                </td>
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
                    {listings.map((l: any, i: number) => {
                      const lid   = l['ID'] || ''
                      const st    = listingStats[lid] || { views7d: 0, views30d: 0, shares7d: 0, shares30d: 0 }
                      // Leads 30 hari: hitung dari data leads yang sudah di-fetch
                      const now30 = Date.now() - 30 * 24 * 60 * 60 * 1000
                      const leads30d = leads.filter((ld: any) => {
                        if ((ld['LISTING_ID'] || ld['listing_id'] || '') !== lid) return false
                        const tgl = ld['Tanggal'] || ld['TANGGAL'] || ld['created_at'] || ''
                        if (!tgl) return true // jika tidak ada tanggal, masukkan saja
                        return new Date(tgl).getTime() >= now30
                      }).length
                      return (
                        <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-primary-200 transition-colors">
                          <div className="flex gap-3 mb-3">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {l['Foto_Utama_URL'] ? (
                                <img src={l['Foto_Utama_URL']} alt={l['Judul']} className="w-full h-full object-cover"/>
                              ) : <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-primary-900 text-sm line-clamp-2">{l['Judul'] || '-'}</p>
                              <p className="text-xs text-gray-400">{l['Kota'] || ''}</p>
                              <span className={`badge text-xs mt-1 ${l['Status_Listing'] === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {l['Status_Listing'] || 'Aktif'}
                              </span>
                            </div>
                          </div>
                          {/* Stats per listing */}
                          <div className="grid grid-cols-3 gap-1.5 text-center text-xs border-t border-gray-100 pt-3">
                            <div className="bg-blue-50 rounded-lg p-2">
                              <div className="text-blue-700 font-bold">👁 View</div>
                              <div className="text-gray-600 mt-0.5">7h: <strong>{st.views7d}</strong></div>
                              <div className="text-gray-600">30h: <strong>{st.views30d}</strong></div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-2">
                              <div className="text-purple-700 font-bold">📩 Lead</div>
                              <div className="text-gray-600 mt-0.5">—</div>
                              <div className="text-gray-600">30h: <strong>{leads30d}</strong></div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-2">
                              <div className="text-green-700 font-bold">📤 Share</div>
                              <div className="text-gray-600 mt-0.5">7h: <strong>{st.shares7d}</strong></div>
                              <div className="text-gray-600">30h: <strong>{st.shares30d}</strong></div>
                            </div>
                          </div>
                          {/* Tombol share listing dari CRM */}
                          {l['Slug'] || lid ? (
                            <button
                              onClick={() => {
                                handleShareListing(lid)
                                const slug = l['Slug'] || lid
                                navigator.clipboard.writeText(`${SITE_URL}/listings/${slug}`).catch(() => {})
                              }}
                              className="mt-2 w-full text-xs text-center py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
                              🔗 Copy Link Listing
                            </button>
                          ) : null}
                        </div>
                      )
                    })}
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
