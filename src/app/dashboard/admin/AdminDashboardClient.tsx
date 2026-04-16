'use client'
import LogoBadge from '@/components/ui/LogoBadge'
import LogoUpload from './LogoUpload'
import KprSettings from './KprSettings'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthUser } from '@/lib/auth'
import { DEFAULT_SCORE_WEIGHTS, AgentScoreWeights } from '@/types'

interface Props { user: AuthUser; stats?: { listings: number; agents: number; news: number } }

type Tab = 'overview' | 'news' | 'logo' | 'settings' | 'kpr' | 'content' | 'scoring'

export default function AdminDashboardClient({ user }: Props) {
  const router = useRouter()
  const [tab, setTab]           = useState<Tab>('overview')
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)

  // Form states (Original GitHub)
  const [newsForm, setNewsForm] = useState({ judul: '', ringkasan: '', konten: '', kategori: 'Berita Properti', foto_url: '' })
  const [logoUrl, setLogoUrl]   = useState('')

  // Form konten web
  const [contentForm, setContentForm] = useState({
    tentang_kami:       '',
    karir:              '',
    kebijakan_privasi:  '',
    syarat_ketentuan:   '',
    hubungi_kami:       '',
    footer_text:        '',
  })
  const [contentLoading, setContentLoading] = useState(false)
  const [contentLoaded,  setContentLoaded]  = useState(false)

  async function loadContent() {
    if (contentLoaded) return
    setContentLoading(true)
    try {
      const keys = Object.keys(contentForm)
      const results = await Promise.all(
        keys.map(k => fetch(`/api/config?key=${k}`).then(r => r.json()).catch(() => ({ value: '' })))
      )
      const updated = { ...contentForm }
      keys.forEach((k, i) => {
        if (results[i]?.value) (updated as Record<string,string>)[k] = String(results[i].value)
      })
      setContentForm(updated)
      setContentLoaded(true)
    } finally { setContentLoading(false) }
  }

  // SEO form state
  const [seoForm, setSeoForm]       = useState({ seo_title: '', seo_desc: '', seo_keywords: '' })
  const [seoLoading, setSeoLoading] = useState(false)
  const [seoLoaded,  setSeoLoaded]  = useState(false)

  async function loadSeo() {
    if (seoLoaded) return
    setSeoLoading(true)
    try {
      const keys = ['seo_title', 'seo_desc', 'seo_keywords'] as const
      const results = await Promise.all(
        keys.map(k => fetch(`/api/config?key=${k}`).then(r => r.json()).catch(() => ({ value: '' })))
      )
      setSeoForm({ seo_title: results[0]?.value ?? '', seo_desc: results[1]?.value ?? '', seo_keywords: results[2]?.value ?? '' })
      setSeoLoaded(true)
    } finally { setSeoLoading(false) }
  }

  async function saveSeo() {
    setSaving(true)
    try {
      const keys = ['seo_title', 'seo_desc', 'seo_keywords'] as const
      await Promise.all(
        keys.map(k => fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: k, value: seoForm[k] }),
        }))
      )
      setSuccess('✅ Pengaturan SEO tersimpan ke Google Sheet!')
    } catch (e: any) {
      setSuccess('❌ Gagal: ' + e.message)
    } finally { setSaving(false); setTimeout(() => setSuccess(''), 4000) }
  }

  // Scoring weights state
  const [scoreWeights, setScoreWeights] = useState<AgentScoreWeights>(DEFAULT_SCORE_WEIGHTS)
  const [scoreLoaded,  setScoreLoaded]  = useState(false)
  const [scoreLoading, setScoreLoading] = useState(false)

  async function loadScoreWeights() {
    if (scoreLoaded) return
    setScoreLoading(true)
    try {
      const res  = await fetch('/api/config?key=score_weights')
      const json = await res.json()
      if (json.value) {
        const parsed = JSON.parse(String(json.value))
        setScoreWeights(w => ({ ...w, ...parsed }))
        setScoreLoaded(true)
      }
    } catch { /* gunakan default */ } finally { setScoreLoading(false) }
  }

  async function saveScoreWeights() {
    setSaving(true)
    try {
      const res  = await fetch('/api/config', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ key: 'score_weights', value: JSON.stringify(scoreWeights) }),
      })
      const json = await res.json()
      setSuccess(json.gasSaved ? '✅ Scoring tersimpan ke Google Sheet!' : '✅ Scoring tersimpan!')
      setScoreLoaded(true)
    } catch (e: any) {
      setSuccess('❌ Gagal: ' + e.message)
    } finally { setSaving(false); setTimeout(() => setSuccess(''), 4000) }
  }

  async function saveContent(key: string, value: string) {
    setSaving(true)
    try {
      const res  = await fetch('/api/config', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ key, value }),
      })
      const json = await res.json()
      setSuccess(json.gasSaved ? '✅ Tersimpan ke Google Sheet!' : '✅ Tersimpan!')
    } catch (e: any) {
      setSuccess('❌ Gagal: ' + e.message)
    } finally { setSaving(false); setTimeout(() => setSuccess(''), 4000) }
  }

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/login')
  }

  async function uploadFotoBerita(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file',          file)
    formData.append('upload_preset', 'crm_unsigned')
    formData.append('folder',        'mansion-realty/news')
    const res  = await fetch('https://api.cloudinary.com/v1_1/dqiqatpac/image/upload', {
      method: 'POST',
      body:   formData,
    })
    const json = await res.json()
    if (json.secure_url) return json.secure_url
    throw new Error(json.error?.message || 'Upload gagal')
  }

  async function handleFotoBerita(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setSuccess('❌ File harus gambar'); return }
    if (file.size > 5 * 1024 * 1024)    { setSuccess('❌ Maks 5MB'); return }
    setSaving(true)
    try {
      const url = await uploadFotoBerita(file)
      setNewsForm(p => ({ ...p, foto_url: url }))
      setSuccess('✅ Foto berhasil diupload!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e: any) {
      setSuccess('❌ Upload foto gagal: ' + e.message)
    } finally { setSaving(false) }
  }

  async function submitNews(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res  = await fetch('/api/news', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          Judul:     newsForm.judul,
          Kategori:  newsForm.kategori,
          Ringkasan: newsForm.ringkasan,
          Konten:    newsForm.konten,
          foto_url:  newsForm.foto_url,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setSuccess('✅ Berita berhasil disimpan ke Google Sheet!')
        setNewsForm({ judul: '', ringkasan: '', konten: '', kategori: 'Berita Properti', foto_url: '' })
      } else {
        setSuccess('❌ Gagal: ' + (json.error || json.message || 'Unknown error'))
      }
    } catch (e: any) {
      setSuccess('❌ Gagal menyimpan: ' + e.message)
    }
    finally { setSaving(false); setTimeout(() => setSuccess(''), 5000) }
  }

  const menuItems = ([
    { id: 'overview' as Tab,  icon: '📊', label: 'Overview',        roles: ['admin','superadmin'] },
    { id: 'news'     as Tab,  icon: '📰', label: 'Input Berita',    roles: ['admin','superadmin'] },
    { id: 'content'  as Tab,  icon: '📝', label: 'Konten Web',      roles: ['superadmin'] },
    { id: 'scoring'  as Tab,  icon: '🏆', label: 'Scoring Top Agen', roles: ['superadmin'] },
    { id: 'logo'     as Tab,  icon: '🖼',  label: 'Ganti Logo',     roles: ['superadmin'] },
    { id: 'kpr'      as Tab,  icon: '🏦', label: 'Setting KPR',    roles: ['admin','superadmin'] },
    { id: 'settings' as Tab,  icon: '⚙️', label: 'Pengaturan SEO', roles: ['superadmin'] },
  ]).filter(m => m.roles.includes(user.role))

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Mobile top bar ─────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-primary-900 text-white flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          {tab !== 'overview' && (
            <button onClick={() => { setTab('overview'); setMobileMenu(false) }} className="text-white/70 hover:text-white mr-1">
              ‹
            </button>
          )}
          <span className="font-bold text-sm">
            {tab === 'overview' ? 'Dashboard' : menuItems.find(m => m.id === tab)?.label ?? 'Dashboard'}
          </span>
        </div>
        <button onClick={() => setMobileMenu(v => !v)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-xl">
          {mobileMenu ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile slide-down menu */}
      {mobileMenu && (
        <div className="md:hidden fixed top-14 left-0 right-0 z-50 bg-primary-900 text-white shadow-xl" onClick={() => setMobileMenu(false)}>
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-semibold border-b border-white/10 transition-colors ${tab === item.id ? 'bg-white/15 text-gold' : 'text-white/80'}`}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
          <button onClick={handleLogout} className="w-full px-5 py-3.5 text-sm text-red-300 font-semibold text-left">
            🚪 Logout
          </button>
        </div>
      )}

      {/* ── Sidebar desktop ─────────────────────────────────── */}
      <div className="w-64 bg-primary-900 text-white flex flex-col fixed h-full z-40 hidden md:flex">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <LogoBadge size="sm" dark={true} />
            <div>
              <div className="font-display font-bold text-sm">Mansion Realty</div>
              <div className="text-white/50 text-xs capitalize">{user.role}</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${tab === item.id ? 'bg-gold text-primary-900' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold uppercase">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-white/40">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full text-xs py-2 border border-white/20 rounded-lg hover:bg-white/10 transition-colors uppercase tracking-widest font-bold">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 flex-1 p-6 pt-20 md:pt-8">

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
            {success}
          </div>
        )}

        {/* ── OVERVIEW (DIISI SESUAI FOTO) ── */}
        {tab === 'overview' && (
          <div>
            <h1 className="section-title mb-6">Dashboard Admin</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon:'🏠', label:'Total Listing',  value:'7', color:'bg-blue-50 text-blue-700' },
                { icon:'👤', label:'Total Agen',      value:'24', color:'bg-green-50 text-green-700' },
                { icon:'📩', label:'Total Leads',    value:'0', color:'bg-purple-50 text-purple-700' },
                { icon:'📰', label:'Total Berita',   value:'0', color:'bg-amber-50 text-amber-700' },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl p-5 ${s.color}`}>
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-3xl font-display font-bold">{s.value}</div>
                  <div className="text-sm font-medium mt-1 opacity-70">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {menuItems.filter(m => m.id !== 'overview').map(item => (
                <button key={item.id} onClick={() => setTab(item.id)}
                  className="card p-6 text-left hover:shadow-card-hover transition-all hover:-translate-y-1">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-display font-bold text-primary-900 text-lg">{item.label}</h3>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── INPUT BERITA (ORIGINAL) ── */}
        {tab === 'news' && (
          <div>
            <h1 className="section-title mb-6">📰 Input Berita Baru</h1>
            <div className="card p-6">
              <form onSubmit={submitNews} className="space-y-5">
                <div>
                  <label className="label-field">Judul Berita *</label>
                  <input className="input-field" placeholder="Judul artikel..." value={newsForm.judul} onChange={e => setNewsForm(p => ({...p, judul: e.target.value}))} required/>
                </div>
                <div>
                  <label className="label-field">Kategori</label>
                  <select className="input-field" value={newsForm.kategori} onChange={e => setNewsForm(p => ({...p, kategori: e.target.value}))}>
                    {['Berita Properti','Tips & Trik','Regulasi','KPR & Pembiayaan','Investasi'].map(k => <option key={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-field">Ringkasan (untuk preview)</label>
                  <textarea className="input-field h-20 resize-none" placeholder="Ringkasan singkat artikel..." value={newsForm.ringkasan} onChange={e => setNewsForm(p => ({...p, ringkasan: e.target.value}))}/>
                </div>
                <div>
                  <label className="label-field">Konten Lengkap *</label>
                  <textarea className="input-field h-48 resize-none" placeholder="Tulis konten artikel di sini..." value={newsForm.konten} onChange={e => setNewsForm(p => ({...p, konten: e.target.value}))} required/>
                </div>
                <div>
                  <label className="label-field">URL Foto Cover</label>
                  {/* Upload dari lokal */}
                  <div className="flex gap-2 items-center">
                    <label className="flex-1 cursor-pointer border-2 border-dashed border-gray-200 hover:border-primary-400 rounded-xl p-3 text-center text-sm text-gray-400 hover:text-primary-700 transition-colors">
                      {newsForm.foto_url
                        ? <span className="text-green-600 font-semibold">✅ Foto terpilih</span>
                        : <span>📁 Klik untuk pilih foto (JPG/PNG, maks 5MB)</span>
                      }
                      <input type="file" accept="image/*" className="hidden" onChange={handleFotoBerita} disabled={saving}/>
                    </label>
                    {newsForm.foto_url && (
                      <button type="button" onClick={() => setNewsForm(p => ({...p, foto_url: ''}))}
                        className="text-red-400 hover:text-red-600 text-xs px-2">✕ Hapus</button>
                    )}
                  </div>
                  {newsForm.foto_url && (
                    <img src={newsForm.foto_url} alt="preview" className="mt-2 h-32 w-auto rounded-xl object-cover border border-gray-200"/>
                  )}
                </div>
                <button type="submit" disabled={saving} className="btn-primary py-3 px-8 disabled:opacity-50">
                  {saving ? '⏳ Menyimpan...' : '💾 Simpan ke Google Sheet'}
                </button>
              </form>
            </div>
          </div>
        )}


        {/* ── KONTEN WEB ── */}
        {tab === 'content' && user.role === 'superadmin' && (
          <div>
            <h1 className="section-title mb-2">📝 Konten Web</h1>
            <p className="text-sm text-gray-400 mb-6">Kelola teks halaman statis & footer. Simpan per-bagian.</p>

            {!contentLoaded && (
              <button onClick={loadContent} disabled={contentLoading}
                className="btn-primary mb-6 disabled:opacity-50">
                {contentLoading ? '⏳ Memuat...' : '🔄 Muat Data Tersimpan'}
              </button>
            )}

            <div className="space-y-6">
              {([
                { key: 'tentang_kami',      label: 'Tentang Kami',           rows: 8,  hint: 'Profil & sejarah perusahaan' },
                { key: 'karir',             label: 'Karir',                  rows: 6,  hint: 'Info lowongan & kultur perusahaan' },
                { key: 'kebijakan_privasi', label: 'Kebijakan Privasi',      rows: 8,  hint: 'Kebijakan penggunaan data pengguna' },
                { key: 'syarat_ketentuan',  label: 'Syarat & Ketentuan',     rows: 8,  hint: 'Syarat penggunaan layanan' },
                { key: 'hubungi_kami',      label: 'Hubungi Kami',           rows: 5,  hint: 'Alamat, telepon, jam operasional' },
                { key: 'footer_text',       label: 'Footer MANSION Realty',  rows: 3,  hint: 'Teks tambahan di bagian bawah footer' },
              ] as const).map(field => (
                <div key={field.key} className="card p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <label className="label-field mb-0">{field.label}</label>
                      <p className="text-xs text-gray-400 mt-0.5">{field.hint}</p>
                    </div>
                    <button
                      onClick={() => saveContent(field.key, contentForm[field.key])}
                      disabled={saving}
                      className="flex-shrink-0 px-4 py-2 text-sm font-semibold bg-primary-900 text-white rounded-xl hover:bg-primary-800 disabled:opacity-50 transition-colors">
                      {saving ? '⏳' : '💾 Simpan'}
                    </button>
                  </div>
                  <textarea
                    className="input-field resize-y text-sm"
                    rows={field.rows}
                    placeholder={`Isi konten ${field.label}...`}
                    value={contentForm[field.key]}
                    onChange={e => setContentForm(p => ({ ...p, [field.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── GANTI LOGO ── */}
        {tab === 'logo' && (
          <div><LogoUpload /></div>
        )}



        {/* ── SCORING TOP AGEN ── */}
        {tab === 'scoring' && user.role === 'superadmin' && (
          <div>
            <h1 className="section-title mb-2">🏆 Scoring Top Agen</h1>
            <p className="text-sm text-gray-400 mb-6">Atur bobot penilaian untuk urutan Top Agen. Perubahan langsung berlaku di halaman Agen.</p>

            {!scoreLoaded && (
              <button onClick={loadScoreWeights} disabled={scoreLoading}
                className="btn-primary mb-6 disabled:opacity-50">
                {scoreLoading ? '⏳ Memuat...' : '🔄 Muat Nilai Tersimpan'}
              </button>
            )}

            <div className="card p-6 space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                {([
                  { key: 'lsp',       label: 'P1 — Bonus punya LSP/Sertifikasi/CRA',  hint: 'Flat bonus (contoh: 1000000)' },
                  { key: 'listing',   label: 'P2 — Bobot per Listing aktif',           hint: 'Nilai × jumlah listing' },
                  { key: 'hitShare',  label: 'P3 — Bobot per Hit+Share di CRM',        hint: 'Nilai × jumlah hit+share' },
                  { key: 'koord',     label: 'P4a — Bonus Role Koordinator',           hint: 'Flat bonus' },
                  { key: 'bm',        label: 'P4b — Bonus Role Business Manager',      hint: 'Flat bonus' },
                  { key: 'principal', label: 'P4c — Bonus Role Principal',             hint: 'Flat bonus' },
                  { key: 'leads',     label: 'P5 — Bobot per Lead',                   hint: 'Nilai × jumlah leads' },
                  { key: 'login',     label: 'P6 — Bobot per Login CRM',               hint: 'Nilai × jumlah login' },
                  { key: 'jadwal',    label: 'P7 — Bobot per Jadwal CRM',              hint: 'Nilai × jumlah jadwal' },
                  { key: 'aktivitas',    label: 'P8 — Bobot per Aktivitas Harian',              hint: 'Nilai × jumlah input aktivitas harian' },
                  { key: 'koordProject', label: 'P9 — Prioritas Koordinator di Halaman Proyeknya', hint: 'Flat bonus: koordinator tampil pertama di picker agen pada halaman proyek miliknya' },
                ] as const).map(field => (
                  <div key={field.key}>
                    <label className="label-field">{field.label}</label>
                    <p className="text-xs text-gray-400 mb-1">{field.hint}</p>
                    <input
                      type="number"
                      className="input-field"
                      value={scoreWeights[field.key]}
                      onChange={e => setScoreWeights(w => ({ ...w, [field.key]: Number(e.target.value) }))}
                      min={0}
                    />
                  </div>
                ))}
              </div>

              {/* Preview formula */}
              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 font-mono space-y-1">
                <p className="font-semibold text-gray-700 mb-2">Preview Formula:</p>
                <p>hasLSP → +{scoreWeights.lsp.toLocaleString('id')}</p>
                <p>listing × {scoreWeights.listing.toLocaleString('id')} &nbsp;|&nbsp; (hit+share) × {scoreWeights.hitShare}</p>
                <p>Koord +{scoreWeights.koord.toLocaleString('id')} &nbsp;|&nbsp; BM +{scoreWeights.bm.toLocaleString('id')} &nbsp;|&nbsp; Principal +{scoreWeights.principal.toLocaleString('id')}</p>
                <p>leads × {scoreWeights.leads} &nbsp;|&nbsp; login × {scoreWeights.login} &nbsp;|&nbsp; jadwal × {scoreWeights.jadwal} &nbsp;|&nbsp; aktivitas × {scoreWeights.aktivitas}</p>
                <p>Koord di proyek sendiri +{(scoreWeights.koordProject ?? 999999).toLocaleString('id')} (tampil pertama di picker)</p>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={saveScoreWeights} disabled={saving}
                  className="btn-primary py-3 px-8 disabled:opacity-50">
                  {saving ? '⏳ Menyimpan...' : '💾 Simpan Scoring'}
                </button>
                <button
                  onClick={() => { setScoreWeights(DEFAULT_SCORE_WEIGHTS); setScoreLoaded(false) }}
                  className="px-4 py-3 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl transition-colors">
                  Reset ke Default
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── KPR SETTINGS (ORIGINAL) ── */}
        {tab === 'kpr' && <KprSettings />}

        {/* ── SETTINGS SEO ── */}
        {tab === 'settings' && user.role === 'superadmin' && (
          <div>
            <h1 className="section-title mb-6">⚙️ Pengaturan SEO & CTA</h1>

            {!seoLoaded && (
              <button onClick={loadSeo} disabled={seoLoading} className="btn-primary mb-6 disabled:opacity-50">
                {seoLoading ? '⏳ Memuat...' : '🔄 Muat Data Tersimpan'}
              </button>
            )}

            <div className="card p-6 space-y-5">
              {([
                { label: 'Judul Website (SEO)', key: 'seo_title' as const, placeholder: 'Mansion Realty — Properti Terpercaya di Jakarta' },
                { label: 'Deskripsi Meta (SEO)', key: 'seo_desc' as const, placeholder: 'Temukan rumah, apartemen & properti investasi terbaik...' },
                { label: 'Keywords', key: 'seo_keywords' as const, placeholder: 'properti jakarta, rumah dijual, apartemen jakarta...' },
              ]).map(field => (
                <div key={field.key}>
                  <label className="label-field">{field.label}</label>
                  <input
                    className="input-field"
                    placeholder={field.placeholder}
                    value={seoForm[field.key]}
                    onChange={e => setSeoForm(p => ({ ...p, [field.key]: e.target.value }))}
                  />
                </div>
              ))}
              <button className="btn-primary disabled:opacity-50" disabled={saving} onClick={saveSeo}>
                {saving ? '⏳ Menyimpan...' : '💾 Simpan Pengaturan'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
