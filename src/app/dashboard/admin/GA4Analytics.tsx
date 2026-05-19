'use client'
import { useState } from 'react'

interface Metrics   { activeUsers: number; sessions: number; pageViews: number }
interface CityData  { city: string; users: number }
interface TypeData  { type: string; views: number }
interface PageData  { path: string; views: number }

interface AnalyticsData {
  configured: boolean
  error?:     string
  message?:   string
  daily?:     Metrics
  weekly?:    Metrics
  monthly?:   Metrics
  cities?:    CityData[]
  typeCounts?: TypeData[]
  topPages?:  PageData[]
  updatedAt?: string
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'jt'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'rb'
  return String(n)
}

function MetricCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-primary-900">{fmt(value)}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-24 text-gray-600 text-xs truncate flex-shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%`, transition: 'width 0.5s ease' }} />
      </div>
      <span className="w-10 text-right text-xs font-semibold text-gray-700">{fmt(value)}</span>
    </div>
  )
}

export default function GA4Analytics() {
  const [data,    setData]    = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [period,  setPeriod]  = useState<'daily' | 'weekly' | 'monthly'>('weekly')

  async function load() {
    setLoading(true)
    try {
      const res  = await fetch('/api/analytics')
      const json = await res.json()
      setData(json)
    } catch { setData({ configured: false, error: 'Gagal menghubungi server' }) }
    finally { setLoading(false) }
  }

  const metrics = data?.[period]
  const maxCity = Math.max(...(data?.cities?.map(c => c.users) ?? [1]))
  const maxType = Math.max(...(data?.typeCounts?.map(t => t.views) ?? [1]))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title mb-1">📊 Google Analytics 4</h1>
          <p className="text-sm text-gray-500">Traffic website Mansion Properti — data realtime dari GA4.</p>
        </div>
        <button onClick={load} disabled={loading}
          className="btn-primary py-2.5 px-5 disabled:opacity-50 flex items-center gap-2">
          {loading ? '⏳ Memuat...' : '🔄 Muat Data GA4'}
        </button>
      </div>

      {/* Belum dimuat */}
      {!data && !loading && (
        <div className="card p-10 text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="font-semibold text-primary-900 text-lg mb-2">Lihat Statistik Traffic Website</p>
          <p className="text-sm text-gray-400 mb-6">Data harian, mingguan, bulanan, kota & tipe properti dari GA4.</p>
          <button onClick={load}
            className="btn-primary py-3 px-8 text-base font-bold mx-auto flex items-center gap-2 justify-center">
            🔄 Muat Data GA4
          </button>
        </div>
      )}

      {/* Belum dikonfigurasi */}
      {data && !data.configured && (
        <div className="card p-6 border-l-4 border-amber-400 bg-amber-50">
          <p className="font-semibold text-amber-800 mb-2">⚙️ GA4 Belum Dikonfigurasi</p>
          <p className="text-sm text-amber-700 mb-3">{data.message ?? data.error}</p>
          <div className="bg-white rounded-xl p-4 text-xs font-mono text-gray-600 space-y-1.5">
            <p className="font-semibold text-gray-700 mb-2">Langkah Setup:</p>
            <p>1. Buat <strong>Service Account</strong> di Google Cloud Console</p>
            <p>2. Tambahkan service account sebagai <strong>Viewer</strong> di GA4 Property</p>
            <p>3. Download JSON key, lalu set env var:</p>
            <p className="bg-gray-50 p-2 rounded mt-1">GA4_PROPERTY_ID=<em>123456789</em></p>
            <p className="bg-gray-50 p-2 rounded">GA4_SERVICE_ACCOUNT_B64=<em>eyJ0eXBlIjoic2VydmljZV9...</em></p>
            <p>4. Tambahkan di <strong>deploy.sh</strong> bagian <code>--set-env-vars</code></p>
          </div>
        </div>
      )}

      {/* Error */}
      {data?.configured && data.error && (
        <div className="card p-4 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm">
          ❌ {data.error}
        </div>
      )}

      {/* Data tersedia */}
      {data?.configured && !data.error && metrics && (
        <>
          {/* Period selector */}
          <div className="flex gap-2">
            {(['daily', 'weekly', 'monthly'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${period === p ? 'bg-primary-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {p === 'daily' ? '📅 Harian' : p === 'weekly' ? '📆 Mingguan' : '🗓 Bulanan'}
              </button>
            ))}
            {data.updatedAt && (
              <span className="ml-auto self-center text-xs text-gray-400">
                Update: {new Date(data.updatedAt).toLocaleTimeString('id-ID')}
              </span>
            )}
          </div>

          {/* Metrik utama */}
          <div className="grid grid-cols-3 gap-4">
            <MetricCard icon="👥" label="Pengguna Aktif" value={metrics.activeUsers} />
            <MetricCard icon="🖱️" label="Sesi"           value={metrics.sessions}   />
            <MetricCard icon="📄" label="Halaman Dilihat" value={metrics.pageViews}  />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Top Kota */}
            <div className="card p-5">
              <h3 className="font-semibold text-primary-900 mb-4 flex items-center gap-2">
                📍 Traffic per Kota
                <span className="text-xs font-normal text-gray-400 ml-auto">30 hari terakhir</span>
              </h3>
              <div className="space-y-3">
                {(data.cities ?? []).map(c => (
                  <BarRow key={c.city} label={c.city} value={c.users} max={maxCity} color="bg-blue-400" />
                ))}
              </div>
            </div>

            {/* Tipe properti */}
            <div className="card p-5">
              <h3 className="font-semibold text-primary-900 mb-4 flex items-center gap-2">
                🏠 Tipe Properti Dicari
                <span className="text-xs font-normal text-gray-400 ml-auto">30 hari terakhir</span>
              </h3>
              <div className="space-y-3">
                {(data.typeCounts ?? []).map(t => (
                  <BarRow key={t.type} label={t.type} value={t.views} max={maxType} color="bg-emerald-400" />
                ))}
              </div>
            </div>
          </div>

          {/* Top Pages */}
          {(data.topPages ?? []).length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-primary-900 mb-4">🔝 Halaman Terpopuler (30 hari)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                      <th className="pb-2">#</th>
                      <th className="pb-2">Halaman</th>
                      <th className="pb-2 text-right">Views</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(data.topPages ?? []).map((p, i) => (
                      <tr key={p.path}>
                        <td className="py-2 text-gray-400 text-xs w-6">{i + 1}</td>
                        <td className="py-2 font-mono text-xs text-primary-700 truncate max-w-[280px]">{p.path}</td>
                        <td className="py-2 text-right font-semibold text-gray-700 text-xs">{fmt(p.views)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Link ke GA4 */}
          <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-blue-700 font-medium">📊 Lihat laporan lengkap di Google Analytics 4</p>
            <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer"
              className="text-sm font-semibold text-blue-700 border border-blue-300 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap">
              Buka GA4 Dashboard →
            </a>
          </div>
        </>
      )}
    </div>
  )
}
