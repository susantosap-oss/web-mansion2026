'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const WA_TITIP = '6281703133252'
const JENIS    = ['Rumah', 'Ruko', 'Tanah/Kavling', 'Gudang', 'Apartemen', 'Gedung', 'Lainnya']
const KOTA     = ['Surabaya', 'Gresik', 'Sidoarjo', 'Malang', 'Lainnya']

interface CleanData { h1: string; description: string; propertyType?: string; city?: string }

interface FormState {
  name: string; phone: string; jenisProperti: string; kota: string
  lokasi: string; harga: string; fotoLink: string; catatan: string
}

const KEUNGGULAN = [
  { icon: '📢', judul: 'Promosi Digital Luas',       desc: 'Dipasarkan di website, media sosial & portal properti nasional.' },
  { icon: '🗂️', judul: 'Database Pembeli Aktif',     desc: 'Langsung dicocokkan dengan calon pembeli di sistem CRM kami.' },
  { icon: '🆓', judul: 'Tanpa Biaya di Awal',        desc: 'Gratis promosi. Komisi hanya jika properti resmi terjual/tersewa.' },
  { icon: '🏆', judul: 'Agen Bersertifikat BNSP',    desc: 'Ditangani agen profesional berpengalaman di pasar lokal.' },
]

export default function TitipListingSlugPage() {
  const params          = useParams()
  const slug            = decodeURIComponent(params.slug as string)
  const [meta, setMeta] = useState<CleanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [done,    setDone]    = useState(false)
  const [sending, setSending] = useState(false)

  const [form, setForm] = useState<FormState>({
    name: '', phone: '', jenisProperti: 'Rumah', kota: 'Surabaya',
    lokasi: '', harga: '', fotoLink: '', catatan: '',
  })

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  useEffect(() => {
    fetch(`/api/config?key=clean_urls`)
      .then(r => r.json())
      .then(j => {
        if (!j.value) return
        const urls = JSON.parse(j.value) as Array<{ pathPrefix: string; slug: string; h1: string; description: string; propertyType?: string; city?: string; active: boolean }>
        const match = urls.find(u => u.pathPrefix === 'titip-listing' && u.slug === slug && u.active)
        if (match) {
          setMeta({ h1: match.h1, description: match.description, propertyType: match.propertyType, city: match.city })
          setForm(p => ({
            ...p,
            jenisProperti: match.propertyType || 'Rumah',
            kota:          match.city || 'Surabaya',
          }))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  const isValid = form.name.trim() && form.phone.trim() && form.lokasi.trim()

  const handleSubmit = async () => {
    if (!isValid) return
    setSending(true)
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
      `Sumber    : /titip-listing/${slug}`,
    ].join('\n')

    try {
      await fetch('/api/leads', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, phone: form.phone, email: '',
          message: msg, source: `TitipListing-${slug}`,
          listingTitle: `${form.jenisProperti} di ${form.lokasi}, ${form.kota}`,
          tipeProperti: form.jenisProperti, jenis: 'Draft', minatTipe: 'Titip/Jual',
          lokasi: `${form.lokasi}, ${form.kota}`, budgetMin: form.harga, budgetMax: form.harga,
        }),
      })
    } catch { /* tetap buka WA */ }
    setSending(false)
    setDone(true)
    window.open(`https://wa.me/${WA_TITIP}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-400 text-sm">Memuat...</div>
    </div>
  )

  if (!meta) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <div className="text-5xl">🔍</div>
      <h1 className="text-xl font-bold text-primary-900">Halaman Tidak Ditemukan</h1>
      <p className="text-gray-500 text-sm">Halaman ini belum tersedia atau sudah tidak aktif.</p>
      <Link href="/titip-listing" className="btn-primary">Ke Halaman Titip Listing</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-primary-900 pt-28 pb-14 overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg,#c9a84c 0,#c9a84c 1px,transparent 0,transparent 50%)', backgroundSize: '20px 20px' }} />
        <div className="section-wrapper relative z-10 max-w-3xl">
          <div className="divider-gold mb-4" />
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white leading-tight mb-3">
            {meta.h1}
          </h1>
          <p className="text-white/70 text-base leading-relaxed">{meta.description}</p>
          <div className="flex flex-wrap gap-2 mt-5">
            {meta.city        && <span className="text-xs bg-white/10 text-white px-3 py-1 rounded-full">📍 {meta.city}</span>}
            {meta.propertyType && <span className="text-xs bg-white/10 text-white px-3 py-1 rounded-full">🏠 {meta.propertyType}</span>}
            <span className="text-xs bg-gold/20 text-gold px-3 py-1 rounded-full">✅ Gratis di Awal</span>
          </div>
        </div>
      </section>

      <div className="section-wrapper max-w-4xl py-10">
        <div className="grid lg:grid-cols-5 gap-8">

          {/* Form */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="card p-6 md:p-7">
              {!done ? (
                <>
                  <h2 className="text-lg font-bold text-primary-900 mb-1">Form Titip Listing</h2>
                  <p className="text-sm text-gray-500 mb-5">Tim agen kami menghubungi Anda dalam 1×24 jam.</p>
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label-field">Nama Pemilik <span className="text-red-400">*</span></label>
                        <input className="input-field" placeholder="Nama lengkap" value={form.name} onChange={set('name')} />
                      </div>
                      <div>
                        <label className="label-field">Nomor WhatsApp <span className="text-red-400">*</span></label>
                        <input className="input-field" placeholder="08xxx" type="tel" value={form.phone} onChange={set('phone')} />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label-field">Jenis Properti</label>
                        <select className="input-field" value={form.jenisProperti} onChange={set('jenisProperti')}>
                          {JENIS.map(j => <option key={j}>{j}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label-field">Kota</label>
                        <select className="input-field" value={form.kota} onChange={set('kota')}>
                          {KOTA.map(k => <option key={k}>{k}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="label-field">Alamat / Lokasi <span className="text-red-400">*</span></label>
                      <input className="input-field" placeholder="cth: Jl. Darmo Permai, Surabaya Barat" value={form.lokasi} onChange={set('lokasi')} />
                    </div>
                    <div>
                      <label className="label-field">Harga Harapan</label>
                      <input className="input-field" placeholder="cth: 1.200.000.000" value={form.harga} onChange={set('harga')} />
                    </div>
                    <div>
                      <label className="label-field">Link Foto</label>
                      <input className="input-field" placeholder="Link Google Drive / Google Photos" value={form.fotoLink} onChange={set('fotoLink')} />
                    </div>
                    <div>
                      <label className="label-field">Catatan Tambahan</label>
                      <textarea className="input-field h-20 resize-none" placeholder="Kondisi, spesifikasi, dll..." value={form.catatan} onChange={set('catatan')} />
                    </div>
                    <button onClick={handleSubmit} disabled={sending || !isValid}
                      className="btn-wa w-full justify-center py-4 font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                      {sending ? 'Mengirim...' : '💬 Kirim via WhatsApp'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✅</div>
                  <h2 className="font-bold text-primary-900 text-xl mb-2">Listing Diterima!</h2>
                  <p className="text-gray-500 text-sm mb-5">Agen kami akan menghubungi Anda dalam 1×24 jam.</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={() => window.open(`https://wa.me/${WA_TITIP}`, '_blank')} className="btn-wa px-6 py-3">💬 Buka WhatsApp</button>
                    <button onClick={() => setDone(false)} className="btn-outline px-6 py-3">+ Titip Lagi</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Keunggulan */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="divider-gold mb-3" />
            <h2 className="text-lg font-bold text-primary-900 mb-4">Mengapa Mansion Properti?</h2>
            <ul className="space-y-3">
              {KEUNGGULAN.map(k => (
                <li key={k.judul} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <span className="text-xl flex-shrink-0">{k.icon}</span>
                  <div>
                    <p className="font-semibold text-primary-900 text-sm">{k.judul}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{k.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-sm text-center">
              <Link href="/titip-listing" className="text-primary-700 hover:underline">← Lihat semua opsi titip listing</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
