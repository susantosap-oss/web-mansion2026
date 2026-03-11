'use client'
import BackButtonDynamic from '@/components/ui/BackButtonDynamic'
import { useState, useCallback, useEffect } from 'react'
import BackButton from '@/components/ui/BackButton'

// ── LOGIKA KALKULASI ──────────────────────────────────────
const CalculatorMansion = {
  annuity: (plafon: number, bungaTahunan: number, tenorTahun: number): number => {
    const i = (bungaTahunan / 100) / 12
    const n = tenorTahun * 12
    const cicilan = (plafon * i) / (1 - Math.pow(1 + i, -n))
    return Math.round(cicilan)
  },
  syariah: (plafon: number, marginTahunan: number, tenorTahun: number): number => {
    const totalMargin = plafon * (marginTahunan / 100) * tenorTahun
    const totalHutang = plafon + totalMargin
    return Math.round(totalHutang / (tenorTahun * 12))
  },
  takeOver: (sisaPokok: number, bungaBaru: number, tenorSisa: number): number => {
    return CalculatorMansion.annuity(sisaPokok, bungaBaru, tenorSisa)
  },
}

type Tab = 'konven' | 'syariah' | 'kmg' | 'takeover'

interface Hasil {
  cicilanPerBulan: number
  // Total Kredit = cicilan x tenor x 12
  totalKredit: number
  // Total Biaya = 10% plafon (dibayar CASH di depan)
  totalBiaya: number
  // Breakdown biaya
  biayaProvisi: number
  biayaAdmin: number
  biayaNotaris: number
  biayaBPHTB: number
  biayaAsuransi: number
  plafon: number
  breakdown: Array<{ bulan: number; angsuran: number; pokok: number; bunga: number; sisa: number }>
}

const BANKS = [
  { nama: 'BTN',     tipe: 'konven',  bunga: 7.50, maxTenor: 30 },
  { nama: 'BCA',     tipe: 'konven',  bunga: 7.75, maxTenor: 25 },
  { nama: 'Mandiri', tipe: 'konven',  bunga: 7.50, maxTenor: 30 },
  { nama: 'BRI',     tipe: 'konven',  bunga: 7.25, maxTenor: 30 },
  { nama: 'BSI',     tipe: 'syariah', bunga: 8.00, maxTenor: 30 },
  { nama: 'BNI Syr', tipe: 'syariah', bunga: 8.50, maxTenor: 25 },
  { nama: 'BTN KMG', tipe: 'kmg',     bunga: 9.50, maxTenor: 15 },
]

function rpFull(n: number): string {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID')
}
function rp(n: number): string {
  if (!n) return 'Rp 0'
  if (n >= 1_000_000_000) return `Rp ${(n/1_000_000_000).toFixed(2).replace(/\.?0+$/,'')} M`
  if (n >= 1_000_000)     return `Rp ${(n/1_000_000).toFixed(1).replace('.0','')} Jt`
  return rpFull(n)
}
function parseRp(v: string): number { return Number(v.replace(/\D/g,'')) || 0 }

function SliderInput({ label, value, min, max, step=1, unit, onChange, fmt }:
  { label:string; value:number; min:number; max:number; step?:number; unit:string; onChange:(v:number)=>void; fmt?:(v:number)=>string }) {
  const pct = ((value-min)/(max-min))*100
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <label className="text-sm font-semibold text-gray-600">{label}</label>
        <span className="text-primary-900 font-bold text-lg">{fmt?fmt(value):value} <span className="text-sm font-normal text-gray-400">{unit}</span></span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{background:`linear-gradient(to right,#0a2342 0%,#0a2342 ${pct}%,#e2e8f0 ${pct}%,#e2e8f0 100%)`}}/>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{fmt?fmt(min):min} {unit}</span><span>{fmt?fmt(max):max} {unit}</span>
      </div>
    </div>
  )
}


const DEFAULT_BANKS = [
  { nama:'BTN',     tipe:'konven'  as const, bunga:7.50, maxTenor:30 },
  { nama:'BCA',     tipe:'konven'  as const, bunga:7.75, maxTenor:25 },
  { nama:'Mandiri', tipe:'konven'  as const, bunga:7.50, maxTenor:30 },
  { nama:'BRI',     tipe:'konven'  as const, bunga:7.25, maxTenor:30 },
  { nama:'BSI',     tipe:'syariah' as const, bunga:8.00, maxTenor:30 },
  { nama:'BNI Syr', tipe:'syariah' as const, bunga:8.50, maxTenor:25 },
  { nama:'BTN KMG', tipe:'kmg'     as const, bunga:9.50, maxTenor:15 },
]

const DEFAULT_DISCLAIMER = [
  { icon:'⚠️', text:'Hasil perhitungan bersifat estimasi. Angka final ditentukan oleh kebijakan bank.' },
  { icon:'💵', text:'Biaya-biaya (~10%) wajib disiapkan tunai sebelum akad kredit ditandatangani.' },
  { icon:'💡', text:'Konsultasikan dengan agen Mansion Realty untuk rekomendasi bank & skema terbaik.' },
]

export default function CalculatorPage() {
  const [tab, setTab]           = useState<Tab>('konven')
  const [BANKS, setBANKS]       = useState(DEFAULT_BANKS)
  const [disclaimers, setDisclaimers] = useState(DEFAULT_DISCLAIMER)

  // Fetch config dari API
  useEffect(() => {
    fetch('/api/config?key=kpr_banks')
      .then(r => r.json())
      .then(j => { if (j.value) try { setBANKS(JSON.parse(j.value)) } catch {} })
      .catch(() => {})
    fetch('/api/config?key=kpr_disclaimer')
      .then(r => r.json())
      .then(j => { if (j.value) try { setDisclaimers(JSON.parse(j.value)) } catch {} })
      .catch(() => {})
  }, [])
  const [hasil, setHasil]       = useState<Hasil|null>(null)
  const [showTable, setShowTable] = useState(false)
  const [animated, setAnimated]   = useState(false)
  const [hargaStr, setHargaStr]   = useState('800000000')
  const [dpStr, setDpStr]         = useState('160000000')
  const [tenor, setTenor]         = useState(20)
  const [bunga, setBunga]         = useState(7.5)
  const [sisaPokokStr, setSisaPokokStr] = useState('300000000')
  const [tenorSisa, setTenorSisa]       = useState(10)
  const [bungaBaru, setBungaBaru]       = useState(7.5)

  const harga   = parseRp(hargaStr)
  const dp      = parseRp(dpStr)
  const plafon  = Math.max(0, harga - dp)
  const dpPct   = harga > 0 ? Math.round((dp/harga)*100) : 0
  const sisaPokok = parseRp(sisaPokokStr)

  useEffect(() => { if (hasil) hitung() }, [tab, tenor, bunga, hargaStr, dpStr, bungaBaru, tenorSisa, sisaPokokStr])

  const hitung = useCallback(() => {
    let cicilan = 0
    let plafonUsed = 0
    const tenorUsed = tab === 'takeover' ? tenorSisa : tenor
    const bungaUsed = tab === 'takeover' ? bungaBaru : bunga

    if (tab === 'takeover') {
      cicilan = CalculatorMansion.takeOver(sisaPokok, bungaBaru, tenorSisa)
      plafonUsed = sisaPokok
    } else {
      if (plafon <= 0) return
      plafonUsed = plafon
      cicilan = tab === 'syariah'
        ? CalculatorMansion.syariah(plafon, bunga, tenor)
        : CalculatorMansion.annuity(plafon, bunga, tenor)
    }

    // Total Kredit = total yang dibayar ke bank via cicilan
    const totalKredit = cicilan * tenorUsed * 12

    // Total Biaya = 10% plafon, dibayar CASH di depan
    const biayaProvisi  = Math.round(plafonUsed * 0.010)
    const biayaAdmin    = Math.round(plafonUsed * 0.005)
    const biayaNotaris  = Math.round(plafonUsed * 0.020)
    const biayaBPHTB    = Math.round(plafonUsed * 0.030)
    const biayaAsuransi = Math.round(plafonUsed * 0.035)
    const totalBiaya    = biayaProvisi + biayaAdmin + biayaNotaris + biayaBPHTB + biayaAsuransi

    // Amortisasi
    const breakdown: Hasil['breakdown'] = []
    let sisa = plafonUsed
    const bungaBln = bungaUsed / 100 / 12
    for (let i = 1; i <= tenorUsed * 12; i++) {
      const bungaAmt = tab === 'syariah'
        ? Math.round((totalKredit - plafonUsed) / (tenorUsed * 12))
        : Math.round(sisa * bungaBln)
      const pokokAmt = cicilan - bungaAmt
      sisa -= pokokAmt
      breakdown.push({ bulan: i, angsuran: cicilan, pokok: pokokAmt, bunga: bungaAmt, sisa: Math.max(0, Math.round(sisa)) })
    }

    setHasil({ cicilanPerBulan: cicilan, totalKredit, totalBiaya, biayaProvisi, biayaAdmin, biayaNotaris, biayaBPHTB, biayaAsuransi, plafon: plafonUsed, breakdown })
    setAnimated(false)
    setTimeout(() => setAnimated(true), 50)
  }, [tab, plafon, tenor, bunga, sisaPokok, bungaBaru, tenorSisa])

  const TABS = [
    { id:'konven'   as Tab, icon:'🏦', label:'Konvensional', desc:'Anuitas' },
    { id:'syariah'  as Tab, icon:'☪️',  label:'Syariah',      desc:'Murabahah' },
    { id:'kmg'      as Tab, icon:'💰', label:'KMG',          desc:'Multiguna' },
    { id:'takeover' as Tab, icon:'🔄', label:'Take Over',    desc:'Alih KPR' },
  ]
  const banks = BANKS.filter(b => tab==='syariah' ? b.tipe==='syariah' : tab==='kmg' ? true : b.tipe==='konven')
  const wa  = process.env.NEXT_PUBLIC_WA_OFFICE || '6281234567890'
  const waMsg = hasil ? `Halo Mansion Realty, saya butuh konsultasi KPR.\n\nSimulasi:\n• Plafon: ${rpFull(hasil.plafon)}\n• Tenor: ${tab==='takeover'?tenorSisa:tenor} tahun\n• Cicilan: ${rpFull(hasil.cicilanPerBulan)}/bulan\n• Total Kredit: ${rpFull(hasil.totalKredit)}\n• Biaya Cash: ${rpFull(hasil.totalBiaya)}\n\nMohon rekomendasikan bank terbaik.` : ''

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-primary-900 py-10 px-4 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'repeating-linear-gradient(45deg,#c9a84c 0,#c9a84c 1px,transparent 0,transparent 50%)',backgroundSize:'20px 20px'}}/>
        <div className="section-wrapper relative z-10">
          <div className="divider-gold mb-3 mt-3"/>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Kalkulator KPR & Pembiayaan</h1>
          <p className="text-white/60 text-sm">Simulasi real-time · 4 skema pembiayaan · Biaya-biaya lengkap</p>
        </div>
      </div>

      <div className="section-wrapper">
        <div className="grid lg:grid-cols-5 gap-6">

          {/* KIRI */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tabs */}
            <div className="bg-white rounded-2xl p-2 shadow-card grid grid-cols-2 gap-1.5">
              {TABS.map(t => (
                <button key={t.id} onClick={()=>{setTab(t.id);setHasil(null)}}
                  className={`py-3 px-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${tab===t.id?'bg-primary-900 text-white':'text-gray-400 hover:bg-gray-50'}`}>
                  <span className="text-base">{t.icon}</span>
                  <span>{t.label}</span>
                  <span className={`text-xs ${tab===t.id?'text-white/60':'text-gray-300'}`}>{t.desc}</span>
                </button>
              ))}
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl p-6 shadow-card space-y-5">
              {tab !== 'takeover' ? (<>
                <div>
                  <label className="label-field">Harga Properti</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">Rp</span>
                    <input type="text" className="input-field pl-9"
                      value={Number(hargaStr).toLocaleString('id-ID')}
                      onChange={e=>setHargaStr(e.target.value.replace(/\D/g,''))}/>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <label className="label-field mb-0">Uang Muka (DP)</label>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-100 text-primary-900">{dpPct}%</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">Rp</span>
                    <input type="text" className="input-field pl-9"
                      value={Number(dpStr).toLocaleString('id-ID')}
                      onChange={e=>setDpStr(e.target.value.replace(/\D/g,''))}/>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {[10,20,30,40].map(p=>(
                      <button key={p} onClick={()=>setDpStr(String(Math.round(harga*p/100)))}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${dpPct===p?'bg-primary-900 text-white border-primary-900':'border-gray-200 text-gray-500 hover:border-primary-300'}`}>
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>
                {plafon > 0 && (
                  <div className="flex justify-between bg-primary-50 rounded-xl px-4 py-2.5 text-sm">
                    <span className="text-gray-500">Plafon KPR</span>
                    <span className="font-bold text-primary-900">{rpFull(plafon)}</span>
                  </div>
                )}
                <SliderInput label="Tenor" value={tenor} min={1} max={30} unit="tahun" onChange={setTenor}/>
                <SliderInput label={tab==='syariah'?'Margin / Tahun':'Bunga / Tahun'}
                  value={bunga} min={1} max={15} step={0.25} unit="%" onChange={setBunga} fmt={v=>v.toFixed(2)}/>
              </>) : (<>
                <div>
                  <label className="label-field">Sisa Pokok KPR Saat Ini</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">Rp</span>
                    <input type="text" className="input-field pl-9"
                      value={Number(sisaPokokStr).toLocaleString('id-ID')}
                      onChange={e=>setSisaPokokStr(e.target.value.replace(/\D/g,''))}/>
                  </div>
                </div>
                <SliderInput label="Tenor Sisa" value={tenorSisa} min={1} max={25} unit="tahun" onChange={setTenorSisa}/>
                <SliderInput label="Bunga Bank Baru" value={bungaBaru} min={1} max={15} step={0.25} unit="%" onChange={setBungaBaru} fmt={v=>v.toFixed(2)}/>
              </>)}

              {/* Bank Presets */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Acuan Bank</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {banks.map(b=>(
                    <button key={b.nama} onClick={()=>{ if(tab==='takeover') setBungaBaru(b.bunga); else { setBunga(b.bunga); setTenor(Math.min(tenor,b.maxTenor)) } }}
                      className="p-2 rounded-xl border border-gray-100 hover:border-primary-400 hover:bg-primary-50 transition-all text-left">
                      <div className="text-xs font-bold text-primary-900">{b.nama}</div>
                      <div className="text-xs text-gray-400">{b.bunga}%</div>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={hitung} className="btn-primary w-full justify-center py-4 font-bold">
                🧮 Hitung Simulasi
              </button>
            </div>
          </div>

          {/* KANAN */}
          <div className="lg:col-span-3 space-y-4">
            {hasil ? (
              <div className={`space-y-4 transition-all duration-300 ${animated?'opacity-100 translate-y-0':'opacity-0 translate-y-4'}`}>

                {/* Cicilan Hero */}
                <div className="bg-primary-900 rounded-2xl p-6 shadow-navy relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5" style={{backgroundImage:'repeating-linear-gradient(45deg,#c9a84c 0,#c9a84c 1px,transparent 0,transparent 50%)',backgroundSize:'18px 18px'}}/>
                  <div className="relative z-10">
                    <p className="text-white/60 text-sm mb-1">Cicilan per Bulan</p>
                    <p className="text-4xl md:text-5xl font-bold text-gold mb-2">{rpFull(hasil.cicilanPerBulan)}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-white/50">
                      <span>📅 Tenor: {tab==='takeover'?tenorSisa:tenor} tahun ({(tab==='takeover'?tenorSisa:tenor)*12} bulan)</span>
                      <span>📊 Bunga: {tab==='takeover'?bungaBaru:bunga}%/tahun</span>
                      {tab==='syariah' && <span>☪️ Murabahah Flat</span>}
                    </div>
                  </div>
                </div>

                {/* ── BREAKDOWN TOTAL ── */}
                <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <h3 className="font-bold text-primary-900 text-base">📊 Rincian Total Pembayaran</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Transparansi biaya lengkap sebelum mengajukan KPR</p>
                  </div>

                  {/* BLOK 1: Total Kredit */}
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm">🏦</div>
                        <div>
                          <p className="font-bold text-primary-900 text-sm">Total Kredit</p>
                          <p className="text-xs text-gray-400">Dibayar via cicilan ke bank</p>
                        </div>
                      </div>
                      <p className="font-bold text-primary-900 text-lg">{rpFull(hasil.totalKredit)}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 space-y-1.5 text-xs">
                      {[
                        ['Plafon KPR (pokok)',          hasil.plafon],
                        [tab==='syariah'?'Total Margin':'Total Bunga', hasil.totalKredit - hasil.plafon],
                      ].map(([label, val]) => (
                        <div key={label as string} className="flex justify-between">
                          <span className="text-gray-500">{label as string}</span>
                          <span className="font-semibold text-gray-700">{rpFull(val as number)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold text-blue-700 pt-1 border-t border-blue-200">
                        <span>Subtotal</span>
                        <span>{rpFull(hasil.totalKredit)}</span>
                      </div>
                    </div>
                  </div>

                  {/* BLOK 2: Total Biaya */}
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-sm">💵</div>
                        <div>
                          <p className="font-bold text-primary-900 text-sm">Total Biaya</p>
                          <p className="text-xs text-red-400 font-semibold">⚡ Dibayar CASH di depan</p>
                        </div>
                      </div>
                      <p className="font-bold text-amber-600 text-lg">{rpFull(hasil.totalBiaya)}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3 space-y-1.5 text-xs">
                      {[
                        ['Biaya Provisi (~1%)',              hasil.biayaProvisi],
                        ['Biaya Admin (~0.5%)',              hasil.biayaAdmin],
                        ['Biaya Notaris & PPAT (~2%)',       hasil.biayaNotaris],
                        ['BPHTB + AJB (~3%)',                hasil.biayaBPHTB],
                        ['Asuransi Jiwa + Kebakaran (~3.5%)',hasil.biayaAsuransi],
                      ].map(([label, val]) => (
                        <div key={label as string} className="flex justify-between">
                          <span className="text-gray-500">{label as string}</span>
                          <span className="font-semibold text-gray-700">{rp(val as number)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold text-amber-700 pt-1 border-t border-amber-200">
                        <span>Subtotal</span>
                        <span>{rpFull(hasil.totalBiaya)}</span>
                      </div>
                    </div>
                  </div>

                  {/* TOTAL AKHIR */}
                  <div className="p-5 bg-primary-900">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-bold">Total Keseluruhan</p>
                        <p className="text-white/50 text-xs">Kredit + Biaya Cash di Depan</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gold">{rpFull(hasil.totalKredit + hasil.totalBiaya)}</p>
                        <p className="text-white/40 text-xs">{rpFull(hasil.cicilanPerBulan)}/bln × {(tab==='takeover'?tenorSisa:tenor)*12} bln + {rp(hasil.totalBiaya)} cash</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amortisasi */}
                <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                  <button onClick={()=>setShowTable(v=>!v)}
                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                    <span className="font-bold text-primary-900">📋 Tabel Amortisasi per Bulan</span>
                    <span className={`text-primary-700 text-sm transition-transform ${showTable?'rotate-180':''}`}>▼</span>
                  </button>
                  {showTable && (
                    <div className="overflow-x-auto max-h-72 overflow-y-auto border-t border-gray-100">
                      <table className="w-full text-xs">
                        <thead className="bg-primary-900 text-white sticky top-0">
                          <tr>
                            <th className="px-3 py-2.5 text-left">Bln</th>
                            <th className="px-3 py-2.5 text-right">Angsuran</th>
                            <th className="px-3 py-2.5 text-right">Pokok</th>
                            <th className="px-3 py-2.5 text-right">{tab==='syariah'?'Margin':'Bunga'}</th>
                            <th className="px-3 py-2.5 text-right">Sisa Pokok</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hasil.breakdown.map((r,i) => (
                            <tr key={r.bulan} className={i%2===0?'bg-gray-50':'bg-white'}>
                              <td className="px-3 py-1.5 text-gray-500 font-semibold">{r.bulan}</td>
                              <td className="px-3 py-1.5 text-right font-bold text-primary-900">{rp(r.angsuran)}</td>
                              <td className="px-3 py-1.5 text-right text-emerald-700">{rp(r.pokok)}</td>
                              <td className="px-3 py-1.5 text-right text-red-400">{rp(r.bunga)}</td>
                              <td className="px-3 py-1.5 text-right text-gray-500">{rp(r.sisa)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="bg-primary-900 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-white font-bold mb-1">Butuh rekomendasi bank terbaik?</p>
                    <p className="text-white/50 text-sm">Konsultasi gratis dengan agen kami</p>
                  </div>
                  <a href={`https://wa.me/${wa}?text=${encodeURIComponent(waMsg)}`}
                     target="_blank" rel="noopener noreferrer" className="btn-wa flex-shrink-0 px-6 py-3">
                    💬 Konsultasi via WA
                  </a>
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-card p-12 text-center flex flex-col items-center justify-center min-h-96">
                <div className="text-6xl mb-4">🏦</div>
                <h3 className="font-bold text-primary-900 text-xl mb-2">Simulasikan KPR Anda</h3>
                <p className="text-gray-400 text-sm max-w-xs">Isi form di sebelah kiri lalu klik Hitung Simulasi</p>
                <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-xs text-xs text-gray-500">
                  {['✅ 4 Skema Pembiayaan','✅ Rincian Total Kredit','✅ Biaya Cash di Depan','✅ Tabel Amortisasi'].map(f=>(
                    <div key={f} className="bg-gray-50 rounded-xl p-3 font-medium">{f}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          {[
            {icon:'⚠️', text:'Hasil perhitungan bersifat estimasi. Angka final ditentukan oleh kebijakan bank.'},
            {icon:'💵', text:'Biaya-biaya (~10%) wajib disiapkan tunai sebelum akad kredit ditandatangani.'},
            {icon:'💡', text:'Konsultasikan dengan agen Mansion Realty untuk rekomendasi bank & skema terbaik.'},
          ].map(d=>(
            <div key={d.text} className="flex gap-2 bg-white rounded-xl p-4 shadow-card">
              <span className="text-lg flex-shrink-0">{d.icon}</span>
              <p className="text-xs text-gray-500 leading-relaxed">{d.text}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance:none; width:20px; height:20px; border-radius:50%;
          background:#0a2342; border:3px solid white; box-shadow:0 2px 8px rgba(10,35,66,0.3);
          cursor:pointer; transition:transform 0.15s;
        }
        input[type='range']::-webkit-slider-thumb:hover { transform:scale(1.2); }
        input[type='range']::-moz-range-thumb {
          width:20px; height:20px; border-radius:50%;
          background:#0a2342; border:3px solid white; cursor:pointer;
        }
      `}</style>
    </div>
  )
}
