'use client'
import LogoBadge from '@/components/ui/LogoBadge'
import LogoUpload from './LogoUpload'
import KprSettings from './KprSettings'
import CleanURLsManager from './CleanURLsManager'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthUser } from '@/lib/auth'
import { DEFAULT_SCORE_WEIGHTS, AgentScoreWeights } from '@/types'
import { markdownToHtml } from '@/lib/markdownToHtml'

interface Props { user: AuthUser; stats?: { listings: number; agents: number; news: number } }

type Tab = 'overview' | 'news' | 'logo' | 'settings' | 'kpr' | 'content' | 'scoring' | 'cleanurls' | 'trends'

export default function AdminDashboardClient({ user }: Props) {
  const router = useRouter()
  const [tab, setTab]           = useState<Tab>('overview')
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [kontenPreview, setKontenPreview] = useState(false)
  const kontenRef = useRef<HTMLTextAreaElement>(null)

  // Form states (Original GitHub)
  const [newsForm, setNewsForm] = useState({ judul: '', ringkasan: '', konten: '', kategori: 'Berita Properti', foto_url: '', tags: '' })
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

  // Google Trends state
  type TrendItem  = { query: string; value: number }
  type TrendResult = { keyword: string; top: TrendItem[]; rising: TrendItem[] }
  const [trendsData,    setTrendsData]    = useState<TrendResult[]>([])
  const [trendsLoading, setTrendsLoading] = useState(false)
  const [trendsSource,  setTrendsSource]  = useState('')
  const [trendKwTab,    setTrendKwTab]    = useState<'Rumah' | 'Ruko'>('Rumah')
  const [copiedQuery,   setCopiedQuery]   = useState('')

  async function loadTrends() {
    setTrendsLoading(true)
    try {
      const res  = await fetch('/api/trends')
      const json = await res.json()
      setTrendsData(json.data ?? [])
      setTrendsSource(json.source === 'google' ? '🌐 Live Google Trends' : '📋 Data Kurasi')
    } catch { setTrendsSource('⚠️ Gagal memuat') }
    finally  { setTrendsLoading(false) }
  }

  function copyQuery(q: string) {
    navigator.clipboard.writeText(q).catch(() => {})
    setCopiedQuery(q)
    setTimeout(() => setCopiedQuery(''), 2000)
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

  function insertMarkdown(wrap: string, placeholder = '', isLine = false) {
    const ta = kontenRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end   = ta.selectionEnd
    const val   = newsForm.konten
    const sel   = val.slice(start, end)
    let newVal: string, newCursor: number

    if (isLine) {
      // prefix setiap baris
      const lines    = (sel || placeholder).split('\n')
      const prefixed = lines.map((l, i) => wrap.replace('$n', String(i + 1)) + l).join('\n')
      newVal    = val.slice(0, start) + prefixed + val.slice(end)
      newCursor = start + prefixed.length
    } else if (wrap === '[](url)') {
      // link: [teks](url)
      const text    = sel || placeholder
      const snippet = `[${text}](url)`
      newVal    = val.slice(0, start) + snippet + val.slice(end)
      newCursor = start + text.length + 3   // posisi cursor di "url"
    } else {
      // wrap kiri-kanan: **teks**
      const text    = sel || placeholder
      const wrapped = `${wrap}${text}${wrap}`
      newVal    = val.slice(0, start) + wrapped + val.slice(end)
      newCursor = sel ? start + wrapped.length : start + wrap.length
    }

    setNewsForm(p => ({ ...p, konten: newVal }))
    requestAnimationFrame(() => {
      ta.setSelectionRange(newCursor, newCursor)
      ta.focus()
    })
  }

  function handleKontenKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!e.ctrlKey) return
    const isList7 = e.shiftKey && e.key === '7'
    const isList8 = e.shiftKey && e.key === '8'
    const key     = e.key.toLowerCase()

    if (!['b','i','k'].includes(key) && !isList7 && !isList8) return
    e.preventDefault()

    if (key === 'b')  insertMarkdown('**', 'teks bold')
    if (key === 'i')  insertMarkdown('*', 'teks italic')
    if (key === 'k')  insertMarkdown('[](url)', 'teks link')
    if (isList7)      insertMarkdown('$n. ', 'item', true)
    if (isList8)      insertMarkdown('- ', 'item', true)
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
          Tags:      newsForm.tags,
        }),
      })
      const json = await res.json()
      if (json.success) {
        await fetch('/api/revalidate', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ secret: 'mansion2026', action: 'getNews' }),
        }).catch(() => {})
        setSuccess('✅ Berita berhasil disimpan ke Google Sheet!')
        setNewsForm({ judul: '', ringkasan: '', konten: '', kategori: 'Berita Properti', foto_url: '', tags: '' })
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
    { id: 'scoring'   as Tab, icon: '🏆', label: 'Scoring Top Agen', roles: ['superadmin'] },
    { id: 'cleanurls' as Tab, icon: '🔗', label: 'Clean URL',        roles: ['superadmin'] },
    { id: 'logo'      as Tab, icon: '🖼',  label: 'Ganti Logo',      roles: ['superadmin'] },
    { id: 'kpr'       as Tab, icon: '🏦', label: 'Setting KPR',     roles: ['admin','superadmin'] },
    { id: 'settings'  as Tab, icon: '⚙️', label: 'Pengaturan SEO',  roles: ['superadmin'] },
    { id: 'trends'    as Tab, icon: '📈', label: 'Google Trends',   roles: ['superadmin'] },
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
                  <label className="label-field">Tags</label>
                  <input className="input-field" placeholder="properti, KPR, investasi" value={newsForm.tags} onChange={e => setNewsForm(p => ({...p, tags: e.target.value}))}/>
                  <p className="text-xs text-gray-400 mt-1">Pisahkan dengan koma. Digunakan untuk filter & pencarian.</p>
                </div>
                <div>
                  <label className="label-field">Ringkasan (untuk preview)</label>
                  <textarea className="input-field h-20 resize-none" placeholder="Ringkasan singkat artikel..." value={newsForm.ringkasan} onChange={e => setNewsForm(p => ({...p, ringkasan: e.target.value}))}/>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="label-field mb-0">Konten Lengkap *</label>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setKontenPreview(false)}
                        className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${!kontenPreview ? 'bg-primary-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        ✏️ Tulis
                      </button>
                      <button type="button" onClick={() => setKontenPreview(true)}
                        className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${kontenPreview ? 'bg-primary-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        👁 Preview
                      </button>
                    </div>
                  </div>

                  {/* Toolbar */}
                  {!kontenPreview && (
                    <div className="flex flex-wrap gap-1 mb-1 p-2 bg-gray-50 rounded-t-xl border border-b-0 border-gray-200">
                      {[
                        { label: 'B',       title: 'Bold (Ctrl+B)',           action: () => insertMarkdown('**', 'teks bold'),        cls: 'font-bold' },
                        { label: 'I',       title: 'Italic (Ctrl+I)',          action: () => insertMarkdown('*', 'teks italic'),        cls: 'italic' },
                        { label: 'H2',      title: 'Heading 2',                action: () => insertMarkdown('## ', 'Judul', true),      cls: '' },
                        { label: 'H3',      title: 'Heading 3',                action: () => insertMarkdown('### ', 'Sub-judul', true), cls: '' },
                        { label: '🔗',      title: 'Link (Ctrl+K)',            action: () => insertMarkdown('[](url)', 'teks link'),    cls: '' },
                        { label: '1.',      title: 'Numbered list (Ctrl+⇧+7)', action: () => insertMarkdown('$n. ', 'item', true),     cls: '' },
                        { label: '•',       title: 'Bullet list (Ctrl+⇧+8)',   action: () => insertMarkdown('- ', 'item', true),       cls: '' },
                        { label: '—',       title: 'Garis pemisah',            action: () => { const ta = kontenRef.current; if (!ta) return; const v = newsForm.konten; const s = ta.selectionStart; const ins = '\n---\n'; setNewsForm(p => ({...p, konten: v.slice(0,s)+ins+v.slice(s)})) }, cls: '' },
                      ].map(btn => (
                        <button key={btn.label} type="button" title={btn.title} onClick={btn.action}
                          className={`px-2 py-0.5 text-xs border border-gray-200 rounded bg-white hover:bg-primary-50 hover:border-primary-300 transition-colors ${btn.cls}`}>
                          {btn.label}
                        </button>
                      ))}
                      <span className="text-xs text-gray-300 self-center ml-1">|</span>
                      <span className="text-xs text-gray-400 self-center">[teks](url) · **bold** · *italic* · ## Judul</span>
                    </div>
                  )}

                  {kontenPreview ? (
                    <div
                      className="input-field h-64 overflow-y-auto prose prose-gray max-w-none text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: markdownToHtml(newsForm.konten) || '<span class="text-gray-300">Belum ada konten</span>' }}
                    />
                  ) : (
                    <textarea
                      ref={kontenRef}
                      className="input-field h-64 resize-y font-mono text-sm rounded-t-none border-t-0"
                      placeholder={'Tulis konten di sini...\n\nContoh:\n## Judul Bagian\n\nParagraf biasa dengan **tebal** dan *miring*.\n\nLink: [klik di sini](https://contoh.com)\n\n- Poin satu\n- Poin dua'}
                      value={newsForm.konten}
                      onChange={e => setNewsForm(p => ({...p, konten: e.target.value}))}
                      onKeyDown={handleKontenKeyDown}
                      required
                    />
                  )}
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

        {/* ── CLEAN URLS ── */}
        {tab === 'cleanurls' && user.role === 'superadmin' && <CleanURLsManager />}

        {/* ── KPR SETTINGS (ORIGINAL) ── */}
        {tab === 'kpr' && <KprSettings />}

        {/* ── GOOGLE TRENDS ── */}
        {tab === 'trends' && user.role === 'superadmin' && (
          <div>
            <h1 className="section-title mb-2">📈 Google Trends Properti</h1>
            <p className="text-sm text-gray-500 mb-6">
              Related Queries untuk <strong>Rumah</strong> &amp; <strong>Ruko</strong> — Lokasi: <span className="text-indigo-600 font-semibold">Jawa Timur</span>.
              Gunakan sebagai referensi saat mengisi slug Clean URL Manager.
            </p>

            {/* Tombol Cek Trend */}
            {!trendsData.length && (
              <button
                onClick={loadTrends}
                disabled={trendsLoading}
                className="btn-primary mb-6 disabled:opacity-50 flex items-center gap-2"
              >
                {trendsLoading ? '⏳ Mengambil data...' : '🔍 Cek Google Trends Sekarang'}
              </button>
            )}

            {trendsData.length > 0 && (
              <div className="space-y-5">
                {/* Header bar */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex gap-2">
                    {(['Rumah', 'Ruko'] as const).map(kw => (
                      <button key={kw}
                        onClick={() => setTrendKwTab(kw)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          trendKwTab === kw
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >{kw}</button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{trendsSource} · ID-JI</span>
                    <button onClick={loadTrends} disabled={trendsLoading}
                      className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40">
                      {trendsLoading ? '⏳' : '🔄 Refresh'}
                    </button>
                  </div>
                </div>

                {/* Data panel */}
                {trendsData.filter(r => r.keyword === trendKwTab).map(result => (
                  <div key={result.keyword} className="grid md:grid-cols-2 gap-4">

                    {/* Top Queries */}
                    <div className="card p-5">
                      <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                        Top Queries
                        <span className="text-xs text-gray-400 font-normal ml-auto">stabil &amp; volume tinggi</span>
                      </h3>
                      <div className="space-y-2.5">
                        {result.top.map((item, i) => (
                          <div key={i} className="group flex items-center gap-3">
                            <span className="text-xs text-gray-400 w-4 text-right">{i+1}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-700 truncate">{item.query}</span>
                                <span className="text-xs text-gray-400 ml-2 shrink-0">{item.value}</span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-400 rounded-full transition-all"
                                  style={{ width: `${item.value}%` }} />
                              </div>
                            </div>
                            <button onClick={() => copyQuery(item.query)}
                              className="opacity-0 group-hover:opacity-100 shrink-0 text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all">
                              {copiedQuery === item.query ? '✓' : 'Copy'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rising Queries */}
                    <div className="card p-5">
                      <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                        Rising Queries
                        <span className="text-xs text-gray-400 font-normal ml-auto">trending naik</span>
                      </h3>
                      <div className="space-y-2.5">
                        {result.rising.map((item, i) => (
                          <div key={i} className="group flex items-center gap-3">
                            <span className="text-xs text-orange-400">↑</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-700 truncate">{item.query}</span>
                                <span className="text-xs text-emerald-500 ml-2 shrink-0 font-medium">
                                  {item.value >= 5000 ? 'Breakout' : `+${item.value}%`}
                                </span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-400 rounded-full transition-all"
                                  style={{ width: `${Math.min(item.value / (item.value >= 5000 ? 50 : 1), 100)}%` }} />
                              </div>
                            </div>
                            <button onClick={() => copyQuery(item.query)}
                              className="opacity-0 group-hover:opacity-100 shrink-0 text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all">
                              {copiedQuery === item.query ? '✓' : 'Copy'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Hint */}
                <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3 border border-gray-100">
                  💡 <strong>Cara pakai:</strong> Hover keyword → klik <em>Copy</em> → paste ke slug Clean URL Manager.
                  Contoh: <code className="bg-gray-100 px-1 rounded">&quot;rumah dijual surabaya&quot;</code> → slug <code className="bg-gray-100 px-1 rounded">/listings/rumah-dijual-surabaya</code>
                </div>
              </div>
            )}
          </div>
        )}

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
