'use client'
import { useState, useEffect, useCallback } from 'react'
import { CleanURL } from '@/types'

// ── Konstanta ─────────────────────────────────────────────
const PROPERTY_TYPES = ['Rumah', 'Apartemen', 'Ruko', 'Kavling', 'Gudang', 'Gedung']
const TRANS_TYPES: { label: string; value: CleanURL['filterType'] }[] = [
  { label: 'Dijual (Sale)', value: 'Sale'      },
  { label: 'Disewa (Rent)', value: 'Rent'      },
  { label: 'Semua',         value: undefined   },
]
const CITIES = [
  'Surabaya','Sidoarjo','Gresik','Malang','Mojokerto','Lamongan',
  'Pasuruan','Bangkalan','Probolinggo','Jombang','Kediri','Blitar',
  'Madiun','Banyuwangi','Jember','Tuban','Bojonegoro','Nganjuk',
]

// ── Auto-SEO generator ────────────────────────────────────
function toSlugPart(text: string): string {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

interface AutoSEO {
  slug: string; label: string; h1: string; title: string; description: string
}

function buildAutoSEO(
  filterType?: CleanURL['filterType'],
  propertyType?: string,
  city?: string
): AutoSEO {
  const typeJual  = filterType === 'Sale' ? 'Jual'   : filterType === 'Rent' ? 'Sewa'    : ''
  const typeVerb  = filterType === 'Sale' ? 'Dijual' : filterType === 'Rent' ? 'Disewa'  : ''
  const prop      = propertyType || 'Properti'
  const propLow   = prop.toLowerCase()
  const locSuffix = city ? ` di ${city}` : ' di Surabaya'
  const locSlug   = city ? `-${toSlugPart(city)}` : ''

  // Slug
  const slugParts = [
    typeJual ? typeJual.toLowerCase() : '',
    propertyType ? toSlugPart(propertyType) : '',
    locSlug.slice(1),
  ].filter(Boolean)
  const slug = slugParts.join('-')

  // Label & H1
  const label = typeVerb ? `${prop} ${typeVerb}${locSuffix}` : `Properti${locSuffix}`
  const h1    = label

  // Meta Title (50-65 char ideal)
  const titleVerb = typeVerb || 'Tersedia'
  const title = `${prop} ${titleVerb}${locSuffix} — ${filterType === 'Sale' ? 'Harga & KPR' : 'Harga Terbaik'} | Mansion Realty`

  // Meta Description — per-propertyType, 140-155 char ideal
  const kpr     = filterType === 'Sale' ? ', KPR tersedia' : ''
  const aksi    = filterType === 'Sale' ? 'dijual' : filterType === 'Rent' ? 'disewa' : 'tersedia'
  let description: string

  switch (propLow) {
    case 'rumah':
      description = `Daftar rumah ${aksi}${locSuffix}: dari subsidi hingga mewah${kpr}. Bandingkan harga, lokasi, dan spesifikasi. Konsultasi gratis bersama agen Mansion Realty.`
      break
    case 'ruko':
      description = `Daftar ruko ${aksi}${locSuffix}: lokasi strategis, siap pakai${kpr}. Cocok untuk bisnis retail & kantor. Hubungi agen Mansion Realty sekarang.`
      break
    case 'gudang':
      description = `Daftar gudang ${aksi}${locSuffix}: berbagai ukuran, dekat tol & pelabuhan${kpr}. Cocok untuk logistik & industri. Survei gratis bersama Mansion Realty.`
      break
    case 'kavling':
      description = `Kavling ${aksi}${locSuffix}: tanah siap bangun, SHM, lokasi strategis${kpr}. Investasi properti terpercaya bersama agen Mansion Realty.`
      break
    case 'apartemen':
      description = `Apartemen ${aksi}${locSuffix}: unit siap huni, fasilitas lengkap${kpr}. Pilih lokasi & harga terbaik bersama agen properti terpercaya Mansion Realty.`
      break
    case 'gedung':
      description = `Gedung ${aksi}${locSuffix}: cocok untuk kantor & komersial${kpr}. Berbagai luas & lantai tersedia. Konsultasi investasi properti bersama Mansion Realty.`
      break
    default:
      description = `Properti ${aksi}${locSuffix}: pilihan terlengkap dari agen terpercaya${kpr}. Harga transparan, konsultasi gratis bersama Mansion Realty.`
  }

  return { slug, label, h1, title, description }
}

// ── State awal form ───────────────────────────────────────
type FormState = Omit<CleanURL, 'id'>
type Touched   = Partial<Record<keyof Omit<FormState, 'filterType' | 'propertyType' | 'city' | 'active'>, boolean>>

const EMPTY_FORM: FormState = {
  slug: '', label: '', filterType: 'Sale', propertyType: 'Rumah',
  city: 'Surabaya', title: '', description: '', h1: '', active: true,
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

  // ── Load ──────────────────────────────────────────────
  async function load() {
    setLoading(true)
    try {
      const res  = await fetch('/api/config?key=clean_urls')
      const json = await res.json()
      setUrls(json.value ? JSON.parse(json.value) : [])
    } catch { notify('❌ Gagal memuat data') } finally { setLoading(false) }
  }

  // ── Save ──────────────────────────────────────────────
  async function save(list: CleanURL[]) {
    setSaving(true)
    try {
      const res  = await fetch('/api/config', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ key: 'clean_urls', value: JSON.stringify(list) }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Gagal menyimpan')
      setUrls(list)
      notify('✅ Tersimpan ke Google Sheet!')
    } catch (e: any) {
      notify('❌ ' + e.message)
    } finally { setSaving(false) }
  }

  useEffect(() => { load() }, [])

  // ── Auto-fill logic ───────────────────────────────────
  // Saat filter (type/prop/city) berubah, isi field yang belum di-override user
  const applyAutoSEO = useCallback((
    next: Partial<Pick<FormState, 'filterType' | 'propertyType' | 'city'>>,
    currentForm: FormState,
    currentTouched: Touched,
    isEditing: boolean
  ): FormState => {
    const merged = { ...currentForm, ...next }
    const auto   = buildAutoSEO(merged.filterType, merged.propertyType, merged.city)

    // Hanya update field yang belum di-touch manual (atau sedang mode tambah baru)
    return {
      ...merged,
      slug:        (!isEditing && !currentTouched.slug)        ? auto.slug        : merged.slug,
      label:       (!currentTouched.label)                     ? auto.label       : merged.label,
      h1:          (!currentTouched.h1)                        ? auto.h1          : merged.h1,
      title:       (!currentTouched.title)                     ? auto.title       : merged.title,
      description: (!currentTouched.description)               ? auto.description : merged.description,
    }
  }, [])

  function handleFilterChange(next: Partial<Pick<FormState, 'filterType' | 'propertyType' | 'city'>>) {
    setForm(prev => applyAutoSEO(next, prev, touched, !!editing))
  }

  // Reset satu field ke nilai auto
  function resetField(field: keyof Touched) {
    const auto = buildAutoSEO(form.filterType, form.propertyType, form.city)
    setForm(prev => ({ ...prev, [field]: auto[field as keyof AutoSEO] }))
    setTouched(prev => ({ ...prev, [field]: false }))
  }

  // Tandai field sebagai manually edited
  function touchField(field: keyof Touched, value: string) {
    const auto = buildAutoSEO(form.filterType, form.propertyType, form.city)
    const isAutoValue = value === auto[field as keyof AutoSEO]
    setTouched(prev => ({ ...prev, [field]: !isAutoValue }))
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // Slug khusus: hanya lowercase alphanumeric + dash
  function handleSlugChange(raw: string) {
    const val = raw.toLowerCase().replace(/[^a-z0-9-]/g, '')
    touchField('slug', val)
  }

  // ── Submit ────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.slug || !form.title || !form.description || !form.h1 || !form.label) {
      notify('❌ Isi semua field wajib'); return
    }
    let list: CleanURL[]
    if (editing) {
      list = urls.map(u => u.id === editing ? { ...form, id: editing } : u)
      setEditing(null)
    } else {
      if (urls.some(u => u.slug === form.slug)) { notify('❌ Slug sudah ada'); return }
      list = [...urls, { ...form, id: crypto.randomUUID() }]
    }
    save(list)
    setForm({ ...EMPTY_FORM })
    setTouched({})
  }

  function startEdit(u: CleanURL) {
    setEditing(u.id)
    const { id, ...rest } = u
    setForm(rest)
    setTouched({ slug: true, label: true, h1: true, title: true, description: true })
  }

  function cancelEdit() {
    setEditing(null)
    setForm({ ...EMPTY_FORM })
    setTouched({})
  }

  function toggleActive(id: string) {
    save(urls.map(u => u.id === id ? { ...u, active: !u.active } : u))
  }

  function remove(id: string) {
    if (!confirm('Hapus clean URL ini?')) return
    save(urls.filter(u => u.id !== id))
  }

  // Preview live
  const preview = buildAutoSEO(form.filterType, form.propertyType, form.city)

  // ── Render ────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="section-title">🔗 Manajemen Clean URL</h1>
        <button onClick={load} disabled={loading} className="btn-outline text-sm py-2 px-4 disabled:opacity-50">
          {loading ? '⏳ Memuat...' : '🔄 Refresh'}
        </button>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-sm font-medium ${msg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {msg}
        </div>
      )}

      {/* ── Daftar ── */}
      <div className="card p-5">
        <h2 className="font-semibold text-primary-900 mb-4">Clean URL Terdaftar</h2>
        {urls.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">Belum ada clean URL. Tambahkan di bawah.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100 text-xs uppercase tracking-wide">
                  <th className="pb-2 pr-3">URL</th>
                  <th className="pb-2 pr-3">Filter</th>
                  <th className="pb-2 pr-3">Lokasi</th>
                  <th className="pb-2 pr-3">Meta Title</th>
                  <th className="pb-2 pr-3">Status</th>
                  <th className="pb-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {urls.map(u => (
                  <tr key={u.id} className={u.active ? '' : 'opacity-40'}>
                    <td className="py-2.5 pr-3 font-mono text-xs text-primary-700 whitespace-nowrap">
                      /listings/{u.slug}
                    </td>
                    <td className="py-2.5 pr-3 text-gray-600 text-xs whitespace-nowrap">
                      {[
                        u.filterType === 'Sale' ? 'Jual' : u.filterType === 'Rent' ? 'Sewa' : 'Semua',
                        u.propertyType,
                      ].filter(Boolean).join(' · ')}
                    </td>
                    <td className="py-2.5 pr-3 text-gray-500 text-xs">{u.city || '—'}</td>
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
        )}
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-primary-900">
            {editing ? '✏️ Edit Clean URL' : '➕ Tambah Clean URL Baru'}
          </h2>
          {!editing && (
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
              Field SEO terisi otomatis · edit manual untuk override
            </span>
          )}
        </div>

        {/* ── Filter Row ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label-field">Tipe Transaksi</label>
            <select className="input-field" value={form.filterType ?? ''}
              onChange={e => handleFilterChange({ filterType: (e.target.value || undefined) as CleanURL['filterType'] })}>
              {TRANS_TYPES.map(t => <option key={String(t.value)} value={t.value ?? ''}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label-field">Tipe Properti</label>
            <select className="input-field" value={form.propertyType ?? ''}
              onChange={e => handleFilterChange({ propertyType: e.target.value || undefined })}>
              <option value="">Semua Properti</option>
              {PROPERTY_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label-field">Lokasi / Kota</label>
            <input
              list="city-list"
              className="input-field"
              placeholder="Surabaya, Sidoarjo, Gresik..."
              value={form.city ?? ''}
              onChange={e => handleFilterChange({ city: e.target.value || undefined })}
            />
            <datalist id="city-list">
              {CITIES.map(c => <option key={c} value={c}/>)}
            </datalist>
          </div>
        </div>

        {/* Preview Slug Live */}
        <div className="bg-primary-50 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <span className="text-gray-400 text-xs">Preview URL:</span>
          <code className="text-primary-800 font-mono font-semibold">
            /listings/{touched.slug ? form.slug : preview.slug}
          </code>
          {touched.slug && (
            <span className="text-xs text-amber-600 ml-auto">⚡ Custom</span>
          )}
        </div>

        {/* ── Slug ── */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label-field mb-0">Slug URL <span className="text-red-500">*</span></label>
            {touched.slug && (
              <button type="button" onClick={() => resetField('slug')}
                className="text-xs text-primary-600 hover:underline">↺ Reset ke auto</button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 whitespace-nowrap">/listings/</span>
            <input className={`input-field ${touched.slug ? 'border-amber-300 bg-amber-50' : ''}`}
              placeholder={preview.slug || 'jual-rumah-surabaya'}
              value={form.slug}
              onChange={e => handleSlugChange(e.target.value)}/>
          </div>
        </div>

        {/* ── Label ── */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label-field mb-0">Label Navigasi <span className="text-red-500">*</span></label>
            {touched.label && (
              <button type="button" onClick={() => resetField('label')}
                className="text-xs text-primary-600 hover:underline">↺ Reset ke auto</button>
            )}
          </div>
          <input className={`input-field ${touched.label ? 'border-amber-300 bg-amber-50' : ''}`}
            placeholder={preview.label}
            value={form.label}
            onChange={e => touchField('label', e.target.value)}/>
        </div>

        {/* ── H1 ── */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label-field mb-0">H1 — Judul Halaman <span className="text-red-500">*</span></label>
            {touched.h1 && (
              <button type="button" onClick={() => resetField('h1')}
                className="text-xs text-primary-600 hover:underline">↺ Reset ke auto</button>
            )}
          </div>
          <input className={`input-field ${touched.h1 ? 'border-amber-300 bg-amber-50' : ''}`}
            placeholder={preview.h1}
            value={form.h1}
            onChange={e => touchField('h1', e.target.value)}/>
        </div>

        {/* ── Meta Title ── */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label-field mb-0">Meta Title SEO <span className="text-red-500">*</span></label>
            {touched.title && (
              <button type="button" onClick={() => resetField('title')}
                className="text-xs text-primary-600 hover:underline">↺ Reset ke auto</button>
            )}
          </div>
          <input className={`input-field ${touched.title ? 'border-amber-300 bg-amber-50' : ''}`}
            placeholder={preview.title}
            value={form.title}
            onChange={e => touchField('title', e.target.value)}/>
          <div className="flex justify-between mt-1">
            <p className={`text-xs ${form.title.length > 65 ? 'text-amber-600' : 'text-gray-400'}`}>
              {form.title.length} karakter {form.title.length > 65 ? '⚠ melebihi 65' : '(ideal: 50–65)'}
            </p>
            {touched.title && <span className="text-xs text-amber-600">⚡ Override manual</span>}
          </div>
        </div>

        {/* ── Meta Description ── */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label-field mb-0">Meta Description SEO <span className="text-red-500">*</span></label>
            {touched.description && (
              <button type="button" onClick={() => resetField('description')}
                className="text-xs text-primary-600 hover:underline">↺ Reset ke auto</button>
            )}
          </div>
          <textarea rows={3} className={`input-field resize-none ${touched.description ? 'border-amber-300 bg-amber-50' : ''}`}
            placeholder={preview.description}
            value={form.description}
            onChange={e => touchField('description', e.target.value)}/>
          <div className="flex justify-between mt-1">
            <p className={`text-xs ${form.description.length > 160 ? 'text-amber-600' : 'text-gray-400'}`}>
              {form.description.length} karakter {form.description.length > 160 ? '⚠ melebihi 160' : '(ideal: 140–155)'}
            </p>
            {touched.description && <span className="text-xs text-amber-600">⚡ Override manual</span>}
          </div>
        </div>

        {/* ── Aktifkan ── */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.active}
            onChange={e => setForm(p => ({ ...p, active: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300"/>
          <span className="text-sm text-gray-700">Aktifkan halaman ini</span>
        </label>

        {/* ── Buttons ── */}
        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={saving} className="btn-primary py-2.5 px-6 disabled:opacity-50">
            {saving ? '⏳ Menyimpan...' : editing ? '💾 Simpan Perubahan' : '➕ Tambah Clean URL'}
          </button>
          {editing && (
            <button type="button" onClick={cancelEdit}
              className="px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50">
              Batal
            </button>
          )}
          {!editing && (
            <button type="button" onClick={() => { setForm({ ...EMPTY_FORM }); setTouched({}) }}
              className="px-4 py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Reset Form
            </button>
          )}
        </div>
      </form>

      {/* ── Info ── */}
      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 space-y-1.5">
        <p className="font-semibold">Cara Kerja</p>
        <p>
          Field SEO terisi <strong>otomatis</strong> berdasarkan kombinasi Transaksi + Properti + Lokasi.
          Ubah isian mana saja untuk <strong>override</strong> — field yang diubah manual ditandai{' '}
          <span className="text-amber-600">⚡ orange</span> dan tidak akan tertimpa lagi oleh auto-generator.
          Klik <span className="font-mono">↺ Reset ke auto</span> untuk kembali ke nilai otomatis.
        </p>
        <p>
          Contoh: pilih <strong>Sewa · Gudang · Sidoarjo</strong> → slug{' '}
          <code className="bg-blue-100 px-1 rounded">/listings/sewa-gudang-sidoarjo</code> langsung
          tersedia dan hanya menampilkan gudang disewa di Sidoarjo dari CRM.
        </p>
      </div>

    </div>
  )
}
