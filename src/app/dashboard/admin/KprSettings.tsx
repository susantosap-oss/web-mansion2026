'use client'
import { useState, useEffect } from 'react'

interface Bank {
  nama: string
  tipe: 'konven' | 'syariah' | 'kmg'
  bunga: number
  maxTenor: number
}

const DEFAULT_BANKS: Bank[] = [
  { nama:'BTN',     tipe:'konven',  bunga:7.50, maxTenor:30 },
  { nama:'BCA',     tipe:'konven',  bunga:7.75, maxTenor:25 },
  { nama:'Mandiri', tipe:'konven',  bunga:7.50, maxTenor:30 },
  { nama:'BRI',     tipe:'konven',  bunga:7.25, maxTenor:30 },
  { nama:'BSI',     tipe:'syariah', bunga:8.00, maxTenor:30 },
  { nama:'BNI Syr', tipe:'syariah', bunga:8.50, maxTenor:25 },
  { nama:'BTN KMG', tipe:'kmg',     bunga:9.50, maxTenor:15 },
]

const DEFAULT_DISCLAIMER = [
  { icon:'⚠️', text:'Hasil perhitungan bersifat estimasi. Angka final ditentukan oleh kebijakan bank.' },
  { icon:'💵', text:'Biaya-biaya (~10%) wajib disiapkan tunai sebelum akad kredit ditandatangani.' },
  { icon:'💡', text:'Konsultasikan dengan agen Mansion Realty untuk rekomendasi bank & skema terbaik.' },
]

export default function KprSettings() {
  const [banks, setBanks]           = useState<Bank[]>(DEFAULT_BANKS)
  const [disclaimer, setDisclaimer] = useState(DEFAULT_DISCLAIMER)
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [msg, setMsg]               = useState('')
  const [tab, setTab]               = useState<'banks'|'disclaimer'>('banks')

  useEffect(() => { fetchConfig() }, [])

  async function fetchConfig() {
    setLoading(true)
    try {
      const [bRes, dRes] = await Promise.all([
        fetch('/api/config?key=kpr_banks'),
        fetch('/api/config?key=kpr_disclaimer'),
      ])
      const bJson = await bRes.json()
      const dJson = await dRes.json()
      if (bJson.value) setBanks(JSON.parse(bJson.value))
      if (dJson.value) setDisclaimer(JSON.parse(dJson.value))
    } catch {}
    finally { setLoading(false) }
  }

  async function saveConfig(key: string, value: any) {
    setSaving(true)
    setMsg('')
    try {
      const res  = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: JSON.stringify(value) }),
      })
      const json = await res.json()
      setMsg(json.success ? '✅ Tersimpan! Berlaku setelah cache refresh (~5 menit)' : '❌ Gagal simpan')
    } catch { setMsg('❌ Koneksi gagal') }
    finally { setSaving(false); setTimeout(() => setMsg(''), 4000) }
  }

  const updateBank = (i: number, field: keyof Bank, val: any) => {
    setBanks(prev => prev.map((b, idx) => idx === i ? { ...b, [field]: field === 'nama' ? val : Number(val) || val } : b))
  }
  const addBank    = () => setBanks(prev => [...prev, { nama: 'Bank Baru', tipe: 'konven', bunga: 7.0, maxTenor: 20 }])
  const removeBank = (i: number) => setBanks(prev => prev.filter((_, idx) => idx !== i))

  const updateDisclaimer = (i: number, field: 'icon'|'text', val: string) => {
    setDisclaimer(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: val } : d))
  }

  if (loading) return <div className="text-center py-12 text-gray-400">⏳ Memuat pengaturan KPR...</div>

  return (
    <div>
      <h1 className="text-xl font-bold text-primary-900 mb-1">🏦 Pengaturan Kalkulator KPR</h1>
      <p className="text-sm text-gray-400 mb-6">Kelola acuan bank dan teks disclaimer di halaman KPR & Pembiayaan</p>

      {msg && (
        <div className={`mb-4 p-3 rounded-xl text-sm ${msg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {msg}
        </div>
      )}

      {/* Sub-tab */}
      <div className="flex gap-2 mb-6">
        {[
          { id:'banks'      as const, label:'🏦 Acuan Bank' },
          { id:'disclaimer' as const, label:'📝 Teks Disclaimer' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? 'bg-primary-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── BANKS ── */}
      {tab === 'banks' && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-primary-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left rounded-l-xl">Nama Bank</th>
                  <th className="px-4 py-3 text-left">Tipe</th>
                  <th className="px-4 py-3 text-left">Bunga (%)</th>
                  <th className="px-4 py-3 text-left">Max Tenor</th>
                  <th className="px-4 py-3 text-center rounded-r-xl">Hapus</th>
                </tr>
              </thead>
              <tbody>
                {banks.map((bank, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-3 py-2">
                      <input value={bank.nama} onChange={e => updateBank(i, 'nama', e.target.value)}
                        className="input-field py-1.5 text-sm"/>
                    </td>
                    <td className="px-3 py-2">
                      <select value={bank.tipe} onChange={e => updateBank(i, 'tipe', e.target.value)}
                        className="input-field py-1.5 text-sm">
                        <option value="konven">Konvensional</option>
                        <option value="syariah">Syariah</option>
                        <option value="kmg">KMG</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" step="0.25" min="1" max="20"
                        value={bank.bunga} onChange={e => updateBank(i, 'bunga', e.target.value)}
                        className="input-field py-1.5 text-sm w-24"/>
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min="1" max="35"
                        value={bank.maxTenor} onChange={e => updateBank(i, 'maxTenor', e.target.value)}
                        className="input-field py-1.5 text-sm w-24"/>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => removeBank(i)}
                        className="w-8 h-8 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors font-bold">
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3">
            <button onClick={addBank}
              className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-primary-400 hover:text-primary-700 transition-colors">
              + Tambah Bank
            </button>
            <button onClick={() => saveConfig('kpr_banks', banks)} disabled={saving}
              className="btn-primary px-6 py-2 disabled:opacity-50">
              {saving ? '⏳ Menyimpan...' : '💾 Simpan Acuan Bank'}
            </button>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 text-xs text-blue-700">
            💡 Data disimpan ke sheet <strong>CONFIG</strong> dengan KEY = <code>kpr_banks</code>. Pastikan GAS mendukung action <code>saveConfig</code> dan <code>getConfig</code>.
          </div>
        </div>
      )}

      {/* ── DISCLAIMER ── */}
      {tab === 'disclaimer' && (
        <div className="space-y-4">
          {disclaimer.map((d, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 flex gap-3">
              <input value={d.icon} onChange={e => updateDisclaimer(i, 'icon', e.target.value)}
                className="input-field w-16 text-center text-lg py-2" placeholder="icon"/>
              <textarea value={d.text} onChange={e => updateDisclaimer(i, 'text', e.target.value)}
                className="input-field flex-1 h-16 resize-none text-sm"/>
            </div>
          ))}

          <button onClick={() => saveConfig('kpr_disclaimer', disclaimer)} disabled={saving}
            className="btn-primary px-6 py-2 disabled:opacity-50">
            {saving ? '⏳ Menyimpan...' : '💾 Simpan Disclaimer'}
          </button>
        </div>
      )}
    </div>
  )
}
