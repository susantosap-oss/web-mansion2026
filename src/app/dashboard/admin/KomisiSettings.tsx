'use client'
import { useState, useEffect } from 'react'

interface KomisiItem { range: string; persen: string }
interface KomisiData {
  jual:    KomisiItem[]
  sewa:    KomisiItem[]
  catatan: string
}

const DEFAULT: KomisiData = {
  jual: [
    { range: '≤ 1 Miliar',     persen: '3'   },
    { range: '> 1 – 3 Miliar', persen: '2.5' },
    { range: '> 3 Miliar',     persen: '2'   },
  ],
  sewa: [
    { range: '≤ 50 Juta', persen: '8' },
    { range: '> 50 Juta', persen: '5' },
  ],
  catatan: 'Komisi dibayarkan setelah transaksi resmi selesai (akad/serah terima kunci). Belum termasuk PPN jika berlaku.',
}

function ItemEditor({
  items, onChange,
}: { items: KomisiItem[]; onChange: (items: KomisiItem[]) => void }) {
  const update = (i: number, field: keyof KomisiItem, val: string) => {
    const next = items.map((item, idx) => idx === i ? { ...item, [field]: val } : item)
    onChange(next)
  }
  const add    = () => onChange([...items, { range: '', persen: '' }])
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))
  const move   = (i: number, dir: -1 | 1) => {
    const next = [...items]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex flex-col gap-0.5">
            <button onClick={() => move(i, -1)} disabled={i === 0}
              className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs leading-none">▲</button>
            <button onClick={() => move(i, 1)} disabled={i === items.length - 1}
              className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs leading-none">▼</button>
          </div>
          <input
            className="input-field flex-1 text-sm"
            placeholder="cth: ≤ 1 Miliar"
            value={item.range}
            onChange={e => update(i, 'range', e.target.value)}
          />
          <div className="relative w-28 flex-shrink-0">
            <input
              className="input-field text-sm pr-7"
              placeholder="3"
              value={item.persen}
              onChange={e => update(i, 'persen', e.target.value.replace(/[^0-9.]/g, ''))}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span>
          </div>
          <button onClick={() => remove(i)}
            className="text-red-400 hover:text-red-600 text-lg flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50">
            ✕
          </button>
        </div>
      ))}
      <button onClick={add}
        className="w-full border border-dashed border-gray-300 text-gray-400 hover:border-primary-400 hover:text-primary-700 rounded-xl py-2 text-sm transition-colors">
        + Tambah Baris
      </button>
    </div>
  )
}

export default function KomisiSettings() {
  const [data,    setData]    = useState<KomisiData>(DEFAULT)
  const [loading, setLoading] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState('')

  useEffect(() => {
    setLoading(true)
    fetch('/api/config?key=komisi_mansion')
      .then(r => r.json())
      .then(j => { if (j.value) setData({ ...DEFAULT, ...JSON.parse(j.value) }) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function save() {
    setSaving(true)
    try {
      const res  = await fetch('/api/config', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ key: 'komisi_mansion', value: JSON.stringify(data) }),
      })
      const json = await res.json()
      setMsg(json.success ? '✅ Komisi tersimpan!' : '❌ Gagal menyimpan')
    } catch { setMsg('❌ Gagal menyimpan') }
    finally { setSaving(false); setTimeout(() => setMsg(''), 4000) }
  }

  if (loading) return <div className="text-gray-400 text-sm py-8 text-center">Memuat data komisi...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title mb-1">💰 Komisi Mansion Properti</h1>
        <p className="text-sm text-gray-500">Atur tabel komisi yang tampil di halaman Titip Listing.</p>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-sm font-medium ${msg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {msg}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Komisi Jual */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🏷️</span>
            <h2 className="font-bold text-primary-900">Komisi Jual</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2 px-1">
            <span className="flex-1">Range Nilai Transaksi</span>
            <span className="w-28 text-center">Komisi (%)</span>
            <span className="w-7"/>
          </div>
          <ItemEditor
            items={data.jual}
            onChange={jual => setData(d => ({ ...d, jual }))}
          />
        </div>

        {/* Komisi Sewa */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🔑</span>
            <h2 className="font-bold text-primary-900">Komisi Sewa</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2 px-1">
            <span className="flex-1">Range Nilai Transaksi</span>
            <span className="w-28 text-center">Komisi (%)</span>
            <span className="w-7"/>
          </div>
          <ItemEditor
            items={data.sewa}
            onChange={sewa => setData(d => ({ ...d, sewa }))}
          />
        </div>
      </div>

      {/* Catatan */}
      <div className="card p-5">
        <label className="label-field">Catatan / Disclaimer</label>
        <textarea
          className="input-field resize-none h-20 text-sm"
          placeholder="cth: Komisi dibayarkan setelah transaksi selesai..."
          value={data.catatan}
          onChange={e => setData(d => ({ ...d, catatan: e.target.value }))}
        />
      </div>

      {/* Preview */}
      <div className="bg-primary-900 rounded-2xl p-6">
        <p className="text-white/60 text-xs uppercase tracking-wider mb-4 font-semibold">Preview di Halaman Titip Listing</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Komisi Jual', icon: '🏷️', items: data.jual },
            { label: 'Komisi Sewa', icon: '🔑', items: data.sewa },
          ].map(col => (
            <div key={col.label} className="bg-white/10 rounded-xl p-4">
              <p className="text-white font-semibold text-sm mb-3">{col.icon} {col.label}</p>
              <div className="space-y-2">
                {col.items.map((item, i) => (
                  <div key={i} className="flex justify-between bg-white/10 rounded-lg px-3 py-2">
                    <span className="text-white/70 text-xs">{item.range || '—'}</span>
                    <span className="text-yellow-400 font-bold text-sm">{item.persen || '—'}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {data.catatan && <p className="text-white/40 text-xs mt-4 text-center">* {data.catatan}</p>}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving}
          className="btn-primary py-3 px-8 disabled:opacity-50">
          {saving ? '⏳ Menyimpan...' : '💾 Simpan Komisi'}
        </button>
        <button onClick={() => setData(DEFAULT)}
          className="px-4 py-3 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl transition-colors">
          Reset ke Default
        </button>
      </div>
    </div>
  )
}
