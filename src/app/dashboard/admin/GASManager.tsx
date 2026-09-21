'use client'
import { useState, useEffect, useCallback } from 'react'

interface TriggerInfo { handler: string; source: string; id: string }
interface StatusData {
  success: boolean
  count?:  number
  healthy?: boolean
  triggers?: TriggerInfo[]
  error?: string
}

function Pill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
      ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}/>
      {label}
    </span>
  )
}

function ActionBtn({
  onClick, loading, disabled, variant, children
}: {
  onClick: () => void
  loading: boolean
  disabled?: boolean
  variant: 'primary' | 'danger'
  children: React.ReactNode
}) {
  const base = 'flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50'
  const cls  = variant === 'danger'
    ? `${base} bg-red-600 hover:bg-red-700 text-white`
    : `${base} bg-primary-900 hover:bg-primary-800 text-white`
  return (
    <button className={cls} onClick={onClick} disabled={loading || disabled}>
      {loading
        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Memproses...</>
        : children}
    </button>
  )
}

export default function GASManager() {
  const [status,    setStatus]    = useState<StatusData | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [actionMsg, setActionMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [lastRefresh, setLastRefresh] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/gas', { cache: 'no-store' })
      const data: StatusData = await res.json()
      setStatus(data)
      setLastRefresh(new Date().toLocaleTimeString('id-ID'))
    } catch {
      setStatus({ success: false, error: 'Tidak bisa terhubung ke GAS' })
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchStatus() }, [fetchStatus])

  async function doAction(action: 'revalidate' | 'reinit') {
    setLoading(true)
    setActionMsg(null)
    try {
      const res  = await fetch('/api/admin/gas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (action === 'reinit') {
        setActionMsg({
          type: data.gas?.success ? 'ok' : 'err',
          text: data.gas?.success
            ? 'Triggers berhasil di-reinit. onEdit + daily trigger aktif.'
            : `GAS error: ${data.gas?.error || 'Tidak bisa reinit via web app (perlu manual di GAS editor)'}`,
        })
        await fetchStatus()
      } else {
        setActionMsg({ type: 'ok', text: `Cache web berhasil di-flush — data segar pukul ${new Date().toLocaleTimeString('id-ID')}` })
      }
    } catch (e) {
      setActionMsg({ type: 'err', text: String(e) })
    } finally { setLoading(false) }
  }

  const GAS_EDITOR = 'https://script.google.com/home/projects'
  const isHealthy  = status?.healthy === true
  const triggerCount = status?.count ?? 0

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-primary-900 mb-1">GAS Control Center</h2>
        <p className="text-sm text-gray-500">
          Kelola koneksi Google Apps Script dan cache data web. Jika data SSoT tidak tampil, gunakan tombol di bawah.
        </p>
      </div>

      {/* Status Panel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-sm text-gray-700">Status GAS Triggers</span>
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="text-xs text-primary-600 hover:text-primary-800 font-semibold disabled:opacity-50"
          >
            {loading ? 'Memuat...' : `↻ Refresh${lastRefresh ? ` · ${lastRefresh}` : ''}`}
          </button>
        </div>

        {status === null ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="w-4 h-4 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin"/>
            Mengambil status...
          </div>
        ) : status.success === false ? (
          <div className="flex items-center gap-2">
            <Pill ok={false} label="GAS tidak bisa diakses"/>
            <span className="text-xs text-gray-400">{status.error}</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Pill ok={isHealthy} label={isHealthy ? 'Triggers aktif' : 'Triggers tidak aktif / kurang'}/>
              <Pill ok={triggerCount >= 1} label={`${triggerCount} trigger terdaftar`}/>
            </div>

            {/* Trigger list */}
            {status.triggers && status.triggers.length > 0 ? (
              <div className="mt-3 space-y-1">
                {status.triggers.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0"/>
                    <span className="font-mono font-semibold text-gray-700">{t.handler}</span>
                    <span className="text-gray-400">·</span>
                    <span>{t.source}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-red-500 mt-2">
                Tidak ada trigger aktif — data web tidak akan otomatis diperbarui saat spreadsheet berubah.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Force Revalidate */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <div>
            <p className="font-semibold text-sm text-gray-800">Force Revalidate Data</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Flush cache web sekarang — data SSoT dari GAS langsung tampil. Gunakan ini saat data sudah telat tampil.
            </p>
          </div>
          <ActionBtn onClick={() => doAction('revalidate')} loading={loading} variant="primary">
            Revalidate Sekarang
          </ActionBtn>
        </div>

        {/* Reinit Triggers */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <div>
            <p className="font-semibold text-sm text-gray-800">Re-init GAS Triggers</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Memanggil <code className="bg-gray-100 px-1 rounded">createAllTriggers()</code> di GAS — memperbaiki trigger OAuth yang expired.
            </p>
          </div>
          <ActionBtn onClick={() => doAction('reinit')} loading={loading} variant="danger">
            Re-init Triggers
          </ActionBtn>
        </div>
      </div>

      {/* Action Result */}
      {actionMsg && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
          actionMsg.type === 'ok'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {actionMsg.type === 'ok' ? '✓ ' : '✗ '}{actionMsg.text}
          {actionMsg.type === 'err' && (
            <div className="mt-2">
              <a href={GAS_EDITOR} target="_blank" rel="noopener noreferrer"
                className="underline text-red-600 font-semibold text-xs">
                Buka GAS Editor → jalankan createAllTriggers() manual →
              </a>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm space-y-2">
        <p className="font-semibold text-amber-800">Kenapa trigger bisa expire?</p>
        <ul className="text-amber-700 text-xs space-y-1 list-disc list-inside">
          <li>Google OAuth token untuk installable GAS triggers expire periodik (2–7 hari)</li>
          <li>Setiap deploy ulang GAS bisa reset auth context trigger</li>
          <li>Cloud Scheduler sudah terpasang sebagai backup revalidate setiap 2 jam</li>
        </ul>
        <div className="pt-1">
          <a href={GAS_EDITOR} target="_blank" rel="noopener noreferrer"
            className="text-amber-700 underline font-semibold text-xs">
            Buka GAS Editor
          </a>
          <span className="text-amber-500 text-xs ml-2">(untuk jalankan createAllTriggers manual jika Re-init via web gagal)</span>
        </div>
      </div>
    </div>
  )
}
