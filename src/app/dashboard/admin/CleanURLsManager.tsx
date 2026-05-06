'use client'
import { useState, useEffect, useCallback } from 'react'
import { CleanURL } from '@/types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mansionpro.id'

function gscUrl(pathPrefix: string, slug: string): string {
  const pageUrl  = `${SITE_URL}/${pathPrefix}/${slug}`
  const resource = encodeURIComponent(SITE_URL + '/')
  const page     = encodeURIComponent('!' + pageUrl)
  return `https://search.google.com/search-console/performance/search-analytics?resource_id=${resource}&breakdown=page&page=${page}`
}

// ── Konstanta ─────────────────────────────────────────────
const PATH_PREFIXES: { value: CleanURL['pathPrefix']; label: string; icon: string; desc: string }[] = [
  { value: 'listings', icon: '🏠', label: 'Listings',  desc: '/listings/{slug}' },
  { value: 'projects', icon: '🏗️', label: 'Projects',  desc: '/projects/{slug}' },
  { value: 'agents',   icon: '👤', label: 'Agents',    desc: '/agents/{slug}'   },
  { value: 'news',     icon: '📰', label: 'News',      desc: '/news/{slug}'     },
]

const PROPERTY_TYPES = ['Rumah', 'Apartemen', 'Ruko', 'Kavling', 'Gudang', 'Gedung']
const TRANS_TYPES: { label: string; value: CleanURL['filterType'] }[] = [
  { label: 'Dijual (Sale)', value: 'Sale'    },
  { label: 'Disewa (Rent)', value: 'Rent'    },
  { label: 'Semua',         value: undefined },
]
const CITIES = [
  'Surabaya','Sidoarjo','Gresik','Malang','Mojokerto','Lamongan',
  'Pasuruan','Bangkalan','Probolinggo','Jombang','Kediri','Blitar',
  'Madiun','Banyuwangi','Jember','Tuban','Bojonegoro','Nganjuk',
]
const NEWS_CATEGORIES = ['Berita Properti','Tips KPR','Investasi','Regulasi','Pasar Properti','Wawasan Agen']

// ── Helpers ───────────────────────────────────────────────
function toSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-')
}

// ── Auto-SEO per pathPrefix ───────────────────────────────
interface AutoSEO { slug: string; label: string; h1: string; title: string; description: string }

function buildAutoSEO(prefix: CleanURL['pathPrefix'], form: Omit<FormState, 'pathPrefix' | 'active'>): AutoSEO {
  const city    = form.city     || 'Surabaya'
  const locSlug = toSlug(city)
  const locText = `di ${city}`

  switch (prefix) {

    case 'listings': {
      const typeJual  = form.filterType === 'Sale' ? 'Jual'   : form.filterType === 'Rent' ? 'Sewa'   : ''
      const typeVerb  = form.filterType === 'Sale' ? 'Dijual' : form.filterType === 'Rent' ? 'Disewa' : ''
      const prop      = form.propertyType || 'Properti'
      const propLow   = prop.toLowerCase()
      const slugParts = [typeJual?.toLowerCase(), form.propertyType ? toSlug(prop) : '', locSlug].filter(Boolean)
      const slug      = slugParts.join('-')
      const label     = typeVerb ? `${prop} ${typeVerb} ${locText}` : `Properti ${locText}`
      const title     = `${prop} ${typeVerb || 'Tersedia'} ${locText} — ${form.filterType === 'Sale' ? 'Harga & KPR' : 'Harga Terbaik'} | Mansion Realty`
      const kpr       = form.filterType === 'Sale' ? ', KPR tersedia' : ''
      const aksi      = form.filterType === 'Sale' ? 'dijual' : form.filterType === 'Rent' ? 'disewa' : 'tersedia'
      const descMap: Record<string, string> = {
        rumah:     `Daftar rumah ${aksi} ${locText}: dari subsidi hingga mewah${kpr}. Bandingkan harga, lokasi, spesifikasi. Konsultasi gratis bersama agen Mansion Realty.`,
        ruko:      `Daftar ruko ${aksi} ${locText}: lokasi strategis, siap pakai${kpr}. Cocok bisnis retail & kantor. Hubungi agen Mansion Realty sekarang.`,
        gudang:    `Daftar gudang ${aksi} ${locText}: berbagai ukuran, dekat tol & pelabuhan${kpr}. Cocok logistik & industri. Survei gratis bersama Mansion Realty.`,
        kavling:   `Kavling ${aksi} ${locText}: tanah siap bangun, SHM, lokasi strategis${kpr}. Investasi properti terpercaya bersama agen Mansion Realty.`,
        apartemen: `Apartemen ${aksi} ${locText}: unit siap huni, fasilitas lengkap${kpr}. Pilih lokasi & harga terbaik bersama agen terpercaya Mansion Realty.`,
        gedung:    `Gedung ${aksi} ${locText}: cocok kantor & komersial${kpr}. Berbagai luas & lantai tersedia. Konsultasi investasi properti bersama Mansion Realty.`,
      }
      return { slug, label, h1: label, title, description: descMap[propLow] || `Properti ${aksi} ${locText}: pilihan terlengkap dari agen terpercaya${kpr}. Harga transparan, konsultasi gratis bersama Mansion Realty.` }
    }

    case 'projects': {
      const prop     = form.propertyType || 'Perumahan'
      const slug     = `proyek-${toSlug(prop)}-${locSlug}`
      const label    = `Proyek ${prop} ${locText}`
      const title    = `Proyek ${prop} ${locText} — Investasi Properti Terpercaya | Mansion Realty`
      const desc     = `Temukan proyek properti terbaru ${locText}: ${prop.toLowerCase()} berkualitas, lokasi strategis, harga kompetitif. Info lengkap & booking bersama Mansion Realty.`
      return { slug, label, h1: label, title, description: desc }
    }

    case 'agents': {
      const slug  = `agen-properti-${locSlug}`
      const label = `Agen Properti ${city}`
      const title = `Agen Properti ${city} Terpercaya — Konsultasi Gratis | Mansion Realty`
      const desc  = `Temukan agen properti profesional & terpercaya ${locText}. Spesialis jual beli & sewa properti, KPR, dan investasi. Konsultasi gratis bersama Mansion Realty.`
      return { slug, label, h1: `Agen Properti ${locText}`, title, description: desc }
    }

    case 'news': {
      const cat   = form.newsCategory || 'Properti'
      const slug  = toSlug(cat)
      const label = `${cat} — Artikel & Berita`
      const title = `${cat} Terkini — Informasi Properti | Mansion Realty`
      const desc  = `Baca artikel & berita ${cat.toLowerCase()} terkini dari Mansion Realty. Tips, analisis pasar, dan panduan properti untuk pembeli & investor.`
      return { slug, label, h1: `${cat} — Berita & Artikel Terbaru`, title, description: desc }
    }
  }
}

// ── Types ─────────────────────────────────────────────────
type FormState = Omit<CleanURL, 'id'> & { newsCategory?: string }
type Touched   = Partial<Record<'slug' | 'label' | 'h1' | 'title' | 'description', boolean>>

const EMPTY_FORM: FormState = {
  pathPrefix: 'listings', slug: '', label: '', filterType: 'Sale',
  propertyType: 'Rumah', city: 'Surabaya', title: '', description: '', h1: '', active: true,
  newsCategory: 'Berita Properti',
}

// ── Komponen utama ────────────────────────────────────────
export default function CleanURLsManager() {
  const [urls,    setUrls]    = useState<CleanURL[]>([])
  const [loading, setLoading] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState('')
  const [form,    setForm]    = useState<FormState>({ ...EMPTY_FORM })
  const [touched, setTouched] = useState<Touched>({})
  const [editing, setEditing] = useState<string | null>(null)

  function notify(m: string) { setMsg(m); setTimeout(() => setMsg(''), 5000) }

  async function load() {
    setLoading(true)
    try {
      const res  = await fetch('/api/config?key=clean_urls')
      const json = await res.json()
      setUrls(json.value ? JSON.parse(json.value) : [])
    } catch { notify('❌ Gagal memuat data') } finally { setLoading(false) }
  }

  async function save(list: CleanURL[]) {
    setSaving(true)
    try {
      const res  = await fetch('/api/config', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'clean_urls', value: JSON.stringify(list) }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Gagal menyimpan')
      setUrls(list)
      notify('✅ Tersimpan ke Google Sheet!')
    } catch (e: unknown) {
      notify('❌ ' + (e instanceof Error ? e.message : String(e)))
    } finally { setSaving(false) }
  }

  useEffect(() => { load() }, [])

  const autoSEO = useCallback((f: FormState) =>
    buildAutoSEO(f.pathPrefix, f), [])

  function applyAuto(next: Partial<FormState>, cur: FormState, curTouched: Touched, isEditing: boolean): FormState {
    const merged = { ...cur, ...next }
    const auto   = autoSEO(merged)
    return {
      ...merged,
      slug:        (!isEditing && !curTouched.slug)  ? auto.slug        : merged.slug,
      label:       !curTouched.label                 ? auto.label       : merged.label,
      h1:          !curTouched.h1                    ? auto.h1          : merged.h1,
      title:       !curTouched.title                 ? auto.title       : merged.title,
      description: !curTouched.description           ? auto.description : merged.description,
    }
  }

  function handleChange(next: Partial<FormState>) {
    setForm(prev => applyAuto(next, prev, touched, !!editing))
  }

  function handlePrefixChange(prefix: CleanURL['pathPrefix']) {
    // Reset form sepenuhnya saat ganti path prefix (kecuali sedang edit)
    if (!editing) {
      setTouched({})
      setForm(prev => applyAuto({ ...EMPTY_FORM, pathPrefix: prefix }, { ...EMPTY_FORM, pathPrefix: prefix }, {}, false))
    } else {
      handleChange({ pathPrefix: prefix })
    }
  }

  function resetField(field: keyof Touched) {
    const auto = autoSEO(form)
    setForm(prev => ({ ...prev, [field]: auto[field] }))
    setTouched(prev => ({ ...prev, [field]: false }))
  }

  function touchField(field: keyof Touched, value: string) {
    const auto = autoSEO(form)
    setTouched(prev => ({ ...prev, [field]: value !== auto[field] }))
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSlugChange(raw: string) {
    touchField('slug', raw.toLowerCase().replace(/[^a-z0-9-]/g, ''))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.slug || !form.title || !form.description || !form.h1 || !form.label) {
      notify('❌ Isi semua field wajib'); return
    }
    let list: CleanURL[]
    const { newsCategory, ...cleanForm } = form
    if (editing) {
      list = urls.map(u => u.id === editing ? { ...cleanForm, id: editing } : u)
      setEditing(null)
    } else {
      if (urls.some(u => u.slug === form.slug && u.pathPrefix === form.pathPrefix)) {
        notify('❌ Slug + path prefix sudah ada'); return
      }
      list = [...urls, { ...cleanForm, id: crypto.randomUUID() }]
    }
    save(list)
    setForm({ ...EMPTY_FORM })
    setTouched({})
  }

  function startEdit(u: CleanURL) {
    setEditing(u.id)
    const { id, ...rest } = u
    setForm({ ...rest, newsCategory: EMPTY_FORM.newsCategory })
    setTouched({ slug: true, label: true, h1: true, title: true, description: true })
  }

  function cancelEdit() { setEditing(null); setForm({ ...EMPTY_FORM }); setTouched({}) }
  function toggleActive(id: string) { save(urls.map(u => u.id === id ? { ...u, active: !u.active } : u)) }
  function remove(id: string) { if (!confirm('Hapus clean URL ini?')) return; save(urls.filter(u => u.id !== id)) }

  const preview     = autoSEO(form)
  const curPrefix   = PATH_PREFIXES.find(p => p.value === form.pathPrefix)!
  const liveSlug    = touched.slug ? form.slug : preview.slug
  const showFilters = form.pathPrefix === 'listings' || form.pathPrefix === 'projects'

  // Group tabel per prefix
  const grouped = PATH_PREFIXES.map(p => ({
    ...p, items: urls.filter(u => (u.pathPrefix ?? 'listings') === p.value),
  })).filter(g => g.items.length > 0)

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="section-title">🔗 Manajemen Clean URL</h1>
        <button onClick={load} disabled={loading} className="btn-outline text-sm py-2 px-4 disabled:opacity-50">
          {loading ? '⏳' : '🔄 Refresh'}
        </button>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-sm font-medium ${msg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {msg}
        </div>
      )}

      {/* ── Tabel per grup ── */}
      {grouped.length === 0 ? (
        <div className="card p-5 text-center text-gray-400 text-sm py-8">Belum ada clean URL. Tambahkan di bawah.</div>
      ) : (
        grouped.map(g => (
          <div key={g.value} className="card p-5">
            <h2 className="font-semibold text-primary-900 mb-4 flex items-center gap-2">
              <span>{g.icon}</span> /{g.value}/
              <span className="text-xs font-normal text-gray-400 ml-1">{g.items.length} URL</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-100 text-xs uppercase tracking-wide">
                    <th className="pb-2 pr-3">URL</th>
                    <th className="pb-2 pr-3">Label</th>
                    <th className="pb-2 pr-3">Meta Title</th>
                    <th className="pb-2 pr-3">Status</th>
                    <th className="pb-2">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {g.items.map(u => (
                    <tr key={u.id} className={u.active ? '' : 'opacity-40'}>
                      <td className="py-2.5 pr-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-primary-700">/{g.value}/{u.slug}</span>
                          <a href={gscUrl(g.value, u.slug)} target="_blank" rel="noopener noreferrer"
                            title="Lihat performa di Google Search Console"
                            className="text-gray-300 hover:text-blue-500 transition-colors flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                              <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd"/>
                              <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd"/>
                            </svg>
                          </a>
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 text-gray-600 text-xs whitespace-nowrap">{u.label}</td>
                      <td className="py-2.5 pr-3 text-gray-700 text-xs max-w-[200px] truncate">{u.title}</td>
                      <td className="py-2.5 pr-3">
                        <button onClick={() => toggleActive(u.id)} disabled={saving}
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${u.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                          {u.active ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td className="py-2.5 flex gap-2">
                        <button onClick={() => startEdit(u)} className="text-xs text-primary-700 hover:underline">Edit</button>
                        <button onClick={() => remove(u.id)} className="text-xs text-red-500 hover:underline">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="card p-5 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-semibold text-primary-900">
            {editing ? '✏️ Edit Clean URL' : '➕ Tambah Clean URL Baru'}
          </h2>
          {!editing && (
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
              SEO terisi otomatis · edit untuk override
            </span>
          )}
        </div>

        {/* Path prefix selector */}
        <div>
          <label className="label-field">Tipe Halaman</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PATH_PREFIXES.map(p => (
              <button key={p.value} type="button"
                onClick={() => handlePrefixChange(p.value)}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-sm font-medium transition-colors ${
                  form.pathPrefix === p.value
                    ? 'bg-primary-50 border-primary-300 text-primary-800'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}>
                <span className="text-lg">{p.icon}</span>
                <span>{p.label}</span>
                <span className="text-xs font-mono opacity-60">{p.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter row — listings & projects */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {form.pathPrefix === 'listings' && (
              <div>
                <label className="label-field">Tipe Transaksi</label>
                <select className="input-field" value={form.filterType ?? ''}
                  onChange={e => handleChange({ filterType: (e.target.value || undefined) as CleanURL['filterType'] })}>
                  {TRANS_TYPES.map(t => <option key={String(t.value)} value={t.value ?? ''}>{t.label}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="label-field">Tipe Properti</label>
              <select className="input-field" value={form.propertyType ?? ''}
                onChange={e => handleChange({ propertyType: e.target.value || undefined })}>
                <option value="">Semua Properti</option>
                {PROPERTY_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Lokasi / Kota</label>
              <input list="city-list" className="input-field" placeholder="Surabaya, Sidoarjo..."
                value={form.city ?? ''}
                onChange={e => handleChange({ city: e.target.value || undefined })}/>
              <datalist id="city-list">{CITIES.map(c => <option key={c} value={c}/>)}</datalist>
            </div>
          </div>
        )}

        {/* City only — agents */}
        {form.pathPrefix === 'agents' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Kota / Wilayah</label>
              <input list="city-list-ag" className="input-field" placeholder="Surabaya, Sidoarjo..."
                value={form.city ?? ''}
                onChange={e => handleChange({ city: e.target.value || undefined })}/>
              <datalist id="city-list-ag">{CITIES.map(c => <option key={c} value={c}/>)}</datalist>
            </div>
          </div>
        )}

        {/* Category — news */}
        {form.pathPrefix === 'news' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Kategori Berita</label>
              <input list="news-cat-list" className="input-field" placeholder="Berita Properti, Tips KPR..."
                value={form.newsCategory ?? ''}
                onChange={e => handleChange({ newsCategory: e.target.value })}/>
              <datalist id="news-cat-list">{NEWS_CATEGORIES.map(c => <option key={c} value={c}/>)}</datalist>
            </div>
          </div>
        )}

        {/* Preview URL */}
        <div className="bg-primary-50 rounded-xl px-4 py-3 text-sm flex items-center gap-2 flex-wrap">
          <span className="text-gray-400 text-xs">Preview URL:</span>
          <code className="text-primary-800 font-mono font-semibold">
            /{form.pathPrefix}/{liveSlug}
          </code>
          {touched.slug && <span className="text-xs text-amber-600 ml-auto">⚡ Custom</span>}
        </div>

        {/* Slug */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label-field mb-0">Slug URL <span className="text-red-500">*</span></label>
            {touched.slug && (
              <button type="button" onClick={() => resetField('slug')} className="text-xs text-primary-600 hover:underline">↺ Reset ke auto</button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 whitespace-nowrap">/{form.pathPrefix}/</span>
            <input className={`input-field ${touched.slug ? 'border-amber-300 bg-amber-50' : ''}`}
              placeholder={preview.slug || curPrefix.desc}
              value={form.slug}
              onChange={e => handleSlugChange(e.target.value)}/>
          </div>
        </div>

        {/* Label */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label-field mb-0">Label Navigasi <span className="text-red-500">*</span></label>
            {touched.label && <button type="button" onClick={() => resetField('label')} className="text-xs text-primary-600 hover:underline">↺ Reset</button>}
          </div>
          <input className={`input-field ${touched.label ? 'border-amber-300 bg-amber-50' : ''}`}
            placeholder={preview.label} value={form.label}
            onChange={e => touchField('label', e.target.value)}/>
        </div>

        {/* H1 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label-field mb-0">H1 — Judul Halaman <span className="text-red-500">*</span></label>
            {touched.h1 && <button type="button" onClick={() => resetField('h1')} className="text-xs text-primary-600 hover:underline">↺ Reset</button>}
          </div>
          <input className={`input-field ${touched.h1 ? 'border-amber-300 bg-amber-50' : ''}`}
            placeholder={preview.h1} value={form.h1}
            onChange={e => touchField('h1', e.target.value)}/>
        </div>

        {/* Meta Title */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label-field mb-0">Meta Title SEO <span className="text-red-500">*</span></label>
            {touched.title && <button type="button" onClick={() => resetField('title')} className="text-xs text-primary-600 hover:underline">↺ Reset</button>}
          </div>
          <input className={`input-field ${touched.title ? 'border-amber-300 bg-amber-50' : ''}`}
            placeholder={preview.title} value={form.title}
            onChange={e => touchField('title', e.target.value)}/>
          <p className={`text-xs mt-1 ${form.title.length > 65 ? 'text-amber-600' : 'text-gray-400'}`}>
            {form.title.length} karakter {form.title.length > 65 ? '⚠ melebihi 65' : '(ideal: 50–65)'}
          </p>
        </div>

        {/* Meta Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label-field mb-0">Meta Description SEO <span className="text-red-500">*</span></label>
            {touched.description && <button type="button" onClick={() => resetField('description')} className="text-xs text-primary-600 hover:underline">↺ Reset</button>}
          </div>
          <textarea rows={3} className={`input-field resize-none ${touched.description ? 'border-amber-300 bg-amber-50' : ''}`}
            placeholder={preview.description} value={form.description}
            onChange={e => touchField('description', e.target.value)}/>
          <p className={`text-xs mt-1 ${form.description.length > 160 ? 'text-amber-600' : 'text-gray-400'}`}>
            {form.description.length} karakter {form.description.length > 160 ? '⚠ melebihi 160' : '(ideal: 140–155)'}
          </p>
        </div>

        {/* Aktifkan */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.active}
            onChange={e => setForm(p => ({ ...p, active: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300"/>
          <span className="text-sm text-gray-700">Aktifkan halaman ini</span>
        </label>

        {/* Buttons */}
        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={saving} className="btn-primary py-2.5 px-6 disabled:opacity-50">
            {saving ? '⏳ Menyimpan...' : editing ? '💾 Simpan Perubahan' : '➕ Tambah Clean URL'}
          </button>
          {editing
            ? <button type="button" onClick={cancelEdit} className="px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50">Batal</button>
            : <button type="button" onClick={() => { setForm({ ...EMPTY_FORM }); setTouched({}) }} className="px-4 py-2.5 text-sm text-gray-400 hover:text-gray-600">Reset</button>
          }
        </div>
      </form>

      {/* Info */}
      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 space-y-1.5">
        <p className="font-semibold">Tipe Halaman yang Didukung</p>
        <ul className="space-y-1 list-none">
          <li>🏠 <strong>/listings/</strong> — filter properti berdasarkan transaksi + tipe + kota</li>
          <li>🏗️ <strong>/projects/</strong> — halaman proyek properti berdasarkan tipe + kota</li>
          <li>👤 <strong>/agents/</strong> — halaman agen properti per kota (contoh: <code className="bg-blue-100 px-1 rounded">agen-properti-surabaya</code>)</li>
          <li>📰 <strong>/news/</strong> — halaman kategori berita & artikel</li>
        </ul>
      </div>

    </div>
  )
}
