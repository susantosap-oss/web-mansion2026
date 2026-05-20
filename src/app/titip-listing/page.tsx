'use client'

import { useState, useEffect } from 'react'
import type { Metadata } from 'next'

// ── Metadata diekspor terpisah agar Next.js bisa baca di server ──
// (metadata hanya bisa dipakai di Server Component, tapi kita butuh
//  'use client' untuk form interaktif. Solusi: buat file metadata.ts
//  terpisah — sudah dilakukan di metadata.ts di folder yang sama.)

const WA_TITIP = '6281703133252'

const DEFAULT_KOMISI = {
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

type KomisiData = typeof DEFAULT_KOMISI

const KOTA = ['Surabaya', 'Gresik', 'Sidoarjo', 'Malang', 'Lainnya']
const JENIS = ['Rumah', 'Ruko', 'Tanah/Kavling', 'Gudang', 'Apartemen', 'Gedung', 'Lainnya']

const KEUNGGULAN = [
  {
    icon: '📢',
    judul: 'Promosi Digital Luas',
    desc: 'Properti Anda dipasarkan di website mansionpro.id, media sosial (Instagram & TikTok), dan jaringan portal properti besar secara bersamaan.',
  },
  {
    icon: '🗂️',
    judul: 'Database Pembeli Aktif',
    desc: 'Listing Anda langsung dicocokkan dengan ratusan calon pembeli yang sudah ada di sistem CRM kami — lebih cepat terjual.',
  },
  {
    icon: '🆓',
    judul: 'Tanpa Biaya di Awal',
    desc: 'Gratis biaya iklan dan promosi. Komisi hanya dibayarkan jika properti Anda resmi terjual atau tersewa.',
  },
  {
    icon: '🏆',
    judul: 'Agen Bersertifikat BNSP',
    desc: 'Ditangani langsung oleh agen profesional bersertifikat nasional dengan pengalaman pasar properti Surabaya & sekitarnya.',
  },
  {
    icon: '📊',
    judul: 'Laporan Perkembangan Rutin',
    desc: 'Anda mendapatkan update perkembangan penjualan secara berkala langsung dari agen penanggung jawab Anda.',
  },
  {
    icon: '⚖️',
    judul: 'Pendampingan Legalitas',
    desc: 'Tim kami membantu proses pengecekan dokumen, balik nama, hingga koordinasi dengan notaris rekanan kami.',
  },
]

interface FormState {
  name: string
  phone: string
  jenisProperti: string
  kota: string
  lokasi: string
  harga: string
  fotoLink: string
  catatan: string
}

const INIT: FormState = {
  name:          '',
  phone:         '',
  jenisProperti: 'Rumah',
  kota:          'Surabaya',
  lokasi:        '',
  harga:         '',
  fotoLink:      '',
  catatan:       '',
}

export default function TitipListingPage() {
  const [form,    setForm]    = useState<FormState>(INIT)
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState('')
  const [komisi,  setKomisi]  = useState<KomisiData>(DEFAULT_KOMISI)

  useEffect(() => {
    fetch('/api/config?key=komisi_mansion')
      .then(r => r.json())
      .then(j => { if (j.value) setKomisi({ ...DEFAULT_KOMISI, ...JSON.parse(j.value) }) })
      .catch(() => {})
  }, [])

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  const isValid = form.name.trim() && form.phone.trim() && form.lokasi.trim()

  const handleSubmit = async () => {
    if (!isValid) return
    setLoading(true)
    setError('')

    const msg = [
      `*Titip Listing Properti — Mansion Realty*`,
      ``,
      `Nama      : ${form.name}`,
      `WA        : ${form.phone}`,
      `Jenis     : ${form.jenisProperti}`,
      `Kota      : ${form.kota}`,
      `Lokasi    : ${form.lokasi}`,
      `Harga     : ${form.harga || '—'}`,
      `Link Foto : ${form.fotoLink || '—'}`,
      `Catatan   : ${form.catatan || '—'}`,
    ].join('\n')

    try {
      await fetch('/api/leads', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:         form.name,
          phone:        form.phone,
          email:        '',
          message:      msg,
          source:       'TitipListing-v2',
          listingTitle: `${form.jenisProperti} di ${form.lokasi}, ${form.kota}`,
          tipeProperti: form.jenisProperti,
          jenis:        'Draft',
          minatTipe:    'Titip/Jual',
          lokasi:       `${form.lokasi}, ${form.kota}`,
          budgetMin:    form.harga,
          budgetMax:    form.harga,
        }),
      })
    } catch {
      /* tetap buka WA walaupun API gagal */
    }

    setLoading(false)
    setDone(true)
    window.open(`https://wa.me/${WA_TITIP}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative bg-primary-900 pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg,#c9a84c 0,#c9a84c 1px,transparent 0,transparent 50%)', backgroundSize: '20px 20px' }}
        />
        <div className="section-wrapper relative z-10 max-w-4xl">
          <div className="divider-gold mb-4" />
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white leading-tight mb-4">
            Jual atau Sewakan Properti Anda<br className="hidden md:block" />
            <span className="text-gradient-gold"> Lebih Cepat Bersama Mansion Properti</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl leading-relaxed">
            Titipkan properti Anda kepada agen profesional kami. Gratis biaya promosi, jangkauan pembeli lebih luas,
            dan proses transparan dari awal hingga closing.
          </p>
          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { n: '500+', l: 'Properti Terjual' },
              { n: '50+',  l: 'Agen Aktif' },
              { n: '4',    l: 'Kota Jangkauan' },
              { n: '100%', l: 'Gratis di Awal' },
            ].map(s => (
              <div key={s.l}>
                <div className="text-2xl font-display font-bold text-gold">{s.n}</div>
                <div className="text-xs text-white/60 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-wrapper max-w-5xl py-12">
        <div className="grid lg:grid-cols-5 gap-10">

          {/* ── FORM ─────────────────────────────────────── */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="card p-6 md:p-8">
              {!done ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-primary-900 mb-1">Form Titip Listing</h2>
                    <p className="text-sm text-gray-500">Isi data di bawah — tim agen kami akan menghubungi Anda dalam 1×24 jam.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Nama & WA */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label-field">Nama Pemilik <span className="text-red-400">*</span></label>
                        <input className="input-field" placeholder="Nama lengkap Anda"
                          value={form.name} onChange={set('name')} />
                      </div>
                      <div>
                        <label className="label-field">Nomor WhatsApp <span className="text-red-400">*</span></label>
                        <input className="input-field" placeholder="08xxx" type="tel"
                          value={form.phone} onChange={set('phone')} />
                      </div>
                    </div>

                    {/* Jenis & Kota */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label-field">Jenis Properti <span className="text-red-400">*</span></label>
                        <select className="input-field" value={form.jenisProperti} onChange={set('jenisProperti')}>
                          {JENIS.map(j => <option key={j}>{j}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label-field">Kota <span className="text-red-400">*</span></label>
                        <select className="input-field" value={form.kota} onChange={set('kota')}>
                          {KOTA.map(k => <option key={k}>{k}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Lokasi */}
                    <div>
                      <label className="label-field">Alamat / Lokasi <span className="text-red-400">*</span></label>
                      <input className="input-field" placeholder="cth: Jl. Darmo Permai, Surabaya Barat"
                        value={form.lokasi} onChange={set('lokasi')} />
                    </div>

                    {/* Harga */}
                    <div>
                      <label className="label-field">Harga Harapan</label>
                      <input className="input-field" placeholder="cth: 1.200.000.000"
                        value={form.harga} onChange={set('harga')} />
                    </div>

                    {/* Link Foto */}
                    <div>
                      <label className="label-field">Link Foto Properti</label>
                      <input className="input-field" placeholder="Link Google Drive / Google Photos / Instagram"
                        value={form.fotoLink} onChange={set('fotoLink')} />
                      <p className="text-xs text-gray-400 mt-1">
                        💡 Bisa juga kirim foto langsung via WA setelah submit.
                      </p>
                    </div>

                    {/* Catatan */}
                    <div>
                      <label className="label-field">Catatan Tambahan</label>
                      <textarea className="input-field h-24 resize-none"
                        placeholder="Kondisi properti, spesifikasi, atau info lainnya..."
                        value={form.catatan} onChange={set('catatan')} />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                      onClick={handleSubmit}
                      disabled={loading || !isValid}
                      className="btn-wa w-full justify-center py-4 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                      {loading ? 'Mengirim...' : '💬 Kirim Listing via WhatsApp'}
                    </button>

                    <p className="text-xs text-gray-400 text-center">
                      Data Anda aman dan hanya digunakan untuk keperluan pemasaran properti.
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✅</div>
                  <h2 className="font-display font-bold text-primary-900 text-2xl mb-3">Listing Diterima!</h2>
                  <p className="text-gray-600 mb-2">
                    Data properti Anda sudah kami terima. Tim agen akan menghubungi Anda via WhatsApp dalam 1×24 jam.
                  </p>
                  <p className="text-sm text-gray-400 mb-6">
                    Jika WA belum terbuka otomatis, klik tombol di bawah.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => window.open(`https://wa.me/${WA_TITIP}`, '_blank')}
                      className="btn-wa px-6 py-3">
                      💬 Buka WhatsApp
                    </button>
                    <button onClick={() => { setDone(false); setForm(INIT) }} className="btn-outline px-6 py-3">
                      + Titip Listing Lagi
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── KEUNGGULAN ──────────────────────────────── */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="mb-2">
              <div className="divider-gold mb-3" />
              <h2 className="text-xl font-bold text-primary-900 mb-1">
                Mengapa Titip Jual di Mansion Properti?
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Dipercaya ratusan pemilik properti di Surabaya, Gresik, Sidoarjo & Malang.
              </p>
            </div>
            <ul className="space-y-4">
              {KEUNGGULAN.map(k => (
                <li key={k.judul} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{k.icon}</span>
                  <div>
                    <p className="font-semibold text-primary-900 text-sm mb-0.5">{k.judul}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{k.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Area Coverage */}
            <div className="mt-6 bg-primary-50 rounded-xl p-4 border border-primary-100">
              <p className="text-xs font-bold text-primary-900 uppercase tracking-wider mb-2">Area Jangkauan</p>
              <div className="flex flex-wrap gap-2">
                {['Surabaya', 'Gresik', 'Sidoarjo', 'Malang', 'Lamongan', 'Mojokerto'].map(k => (
                  <span key={k} className="text-xs bg-white border border-primary-200 text-primary-800 px-2.5 py-1 rounded-full font-medium">
                    📍 {k}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── KOMISI STANDAR ───────────────────────────────── */}
      <section className="bg-primary-900 py-12">
        <div className="section-wrapper max-w-3xl">
          <div className="divider-gold mb-3" />
          <h2 className="text-xl font-bold text-white mb-1">Komisi Standar Mansion Properti</h2>
          <p className="text-white/60 text-sm mb-8">Transparan & kompetitif — komisi hanya dibayar setelah transaksi resmi selesai.</p>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Komisi Jual */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🏷️</span>
                <h3 className="font-bold text-white text-base">Komisi Jual</h3>
              </div>
              <div className="space-y-3">
                {komisi.jual.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
                    <span className="text-white/80 text-sm">{item.range}</span>
                    <span className="text-gold font-bold text-lg">{item.persen}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Komisi Sewa */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🔑</span>
                <h3 className="font-bold text-white text-base">Komisi Sewa</h3>
              </div>
              <div className="space-y-3">
                {komisi.sewa.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
                    <span className="text-white/80 text-sm">{item.range}</span>
                    <span className="text-gold font-bold text-lg">{item.persen}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {komisi.catatan && (
            <p className="text-white/50 text-xs mt-5 text-center">* {komisi.catatan}</p>
          )}
        </div>
      </section>

      {/* ── FAQ / TRUST ──────────────────────────────────── */}
      <section className="bg-white border-t border-gray-100 py-12">
        <div className="section-wrapper max-w-3xl">
          <div className="divider-gold mb-3" />
          <h2 className="text-xl font-bold text-primary-900 mb-6">Pertanyaan Umum</h2>
          <div className="space-y-4">
            {[
              { q: 'Apakah gratis untuk titip listing?', a: 'Ya, 100% gratis di awal. Komisi hanya berlaku jika properti Anda resmi terjual atau tersewa.' },
              { q: 'Berapa lama properti saya dipasarkan?', a: 'Kami mulai memasarkan properti Anda dalam 1×24 jam setelah data diverifikasi oleh agen kami.' },
              { q: 'Apakah saya perlu hadir saat survei?', a: 'Tidak wajib. Agen kami dapat mengatur jadwal survei yang fleksibel sesuai ketersediaan Anda.' },
              { q: 'Bagaimana cara saya memantau perkembangan?', a: 'Agen penanggung jawab akan memberikan laporan update secara berkala langsung via WhatsApp.' },
            ].map(item => (
              <div key={item.q} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                <p className="font-semibold text-primary-900 text-sm mb-1">❓ {item.q}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
