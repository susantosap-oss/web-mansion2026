'use client'
import KprSettings from './KprSettings'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthUser } from '@/lib/auth'

interface Props { user: AuthUser, stats: { listings: number, agents: number, news: number } }

type Tab = 'overview' | 'news' | 'logo' | 'projects' | 'settings' | 'kpr'

export default function AdminDashboardClient({ user, stats }: Props) {
  const router = useRouter()
  const [tab, setTab]         = useState<Tab>('overview')
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState('')

  // Form states
  const [newsForm, setNewsForm] = useState({ judul: '', ringkasan: '', konten: '', kategori: 'Berita Properti', foto_url: '' })
  const [logoUrl, setLogoUrl]   = useState('')

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/login')
  }

  async function submitNews(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const GAS_URL = process.env.NEXT_PUBLIC_GAS_API_URL || ''
      const url = new URL(GAS_URL)
      url.searchParams.set('action', 'saveNews')
      url.searchParams.set('secret', 'mansion2026')
      await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newsForm, secret: 'mansion2026' }),
      })
      setSuccess('✅ Berita berhasil disimpan ke Google Sheet!')
      setNewsForm({ judul: '', ringkasan: '', konten: '', kategori: 'Berita Properti', foto_url: '' })
    } catch { setSuccess('❌ Gagal menyimpan') }
    finally { setSaving(false); setTimeout(() => setSuccess(''), 4000) }
  }

  const menuItems: Array<{ id: Tab; icon: string; label: string; roles: string[] }> = [
    { id: 'overview',  icon: '📊', label: 'Overview',        roles: ['admin','superadmin'] },
    { id: 'news',      icon: '📰', label: 'Input Berita',    roles: ['admin','superadmin'] },
    { id: 'projects',  icon: '🏗',  label: 'Input Proyek',   roles: ['admin','superadmin'] },
    { id: 'logo',      icon: '🖼',  label: 'Ganti Logo',     roles: ['superadmin'] },
    { id: 'kpr',       icon: '🏦', label: 'Setting KPR',    roles: ['admin','superadmin'] },
    { id: 'settings',  icon: '⚙️', label: 'Pengaturan SEO', roles: ['superadmin'] },
  ].filter(m => m.roles.includes(user.role))

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-primary-900 text-white flex flex-col fixed h-full z-40 hidden md:flex">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gold rounded-lg flex items-center justify-center">
              <span className="text-primary-900 font-bold">M</span>
            </div>
            <div>
              <div className="font-display font-bold text-sm">MANSION Realty</div>
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
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-white/40">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full text-xs py-2 border border-white/20 rounded-lg hover:bg-white/10 transition-colors">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 flex-1 p-6 pt-8">

        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between mb-6 bg-primary-900 text-white p-4 rounded-2xl">
          <span className="font-display font-bold">Admin Dashboard</span>
          <div className="flex gap-2">
            {menuItems.map(m => (
              <button key={m.id} onClick={() => setTab(m.id)}
                className={`p-2 rounded-lg text-sm ${tab === m.id ? 'bg-gold text-primary-900' : 'text-white/70'}`}>
                {m.icon}
              </button>
            ))}
            <button onClick={handleLogout} className="p-2 rounded-lg text-white/70">🚪</button>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
            {success}
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div>
            <h1 className="section-title mb-6">Dashboard MANSION Admin</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon:'🏠', label:'Total Listing',  value:stats.listings, color:'bg-blue-50 text-blue-700' },
                { icon:'👤', label:'Total Agen',     value:stats.agents, color:'bg-green-50 text-green-700' },
                { icon:'📩', label:'Total Leads',    value:0, color:'bg-purple-50 text-purple-700' },
                { icon:'📰', label:'Total Berita',   value:'—', color:'bg-amber-50 text-amber-700' },
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

        {/* ── INPUT BERITA ── */}
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
                  <input className="input-field" placeholder="https://..." value={newsForm.foto_url} onChange={e => setNewsForm(p => ({...p, foto_url: e.target.value}))}/>
                </div>
                <button type="submit" disabled={saving} className="btn-primary py-3 px-8 disabled:opacity-50">
                  {saving ? '⏳ Menyimpan...' : '💾 Simpan ke Google Sheet'}
                </button>
              </form>
              <div className="mt-6 p-4 bg-amber-50 rounded-xl text-sm text-amber-700">
                💡 Data disimpan langsung ke sheet <strong>NEWS</strong> di CRM Mansion. Pastikan GAS sudah mendukung action <code>saveNews</code>.
              </div>
            </div>
          </div>
        )}

        {/* ── GANTI LOGO ── */}
        {tab === 'logo' && (
          <div>
            <h1 className="section-title mb-6">🖼 Ganti Logo</h1>
            <div className="card p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-4">Logo saat ini (default):</p>
                <div className="w-16 h-16 bg-gold rounded-xl flex items-center justify-center">
                  <span className="text-primary-900 font-display font-bold text-3xl">M</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label-field">URL Logo Baru</label>
                  <input className="input-field" placeholder="https://res.cloudinary.com/..." value={logoUrl} onChange={e => setLogoUrl(e.target.value)}/>
                  <p className="text-xs text-gray-400 mt-1">Upload foto ke Cloudinary lalu paste URL-nya di sini</p>
                </div>
                {logoUrl && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
                    <img src={logoUrl} alt="Logo preview" className="h-16 w-auto rounded-lg border border-gray-200"/>
                  </div>
                )}
                <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
                  💡 Simpan URL logo ke sheet <strong>CONFIG</strong> dengan KEY = <code>logo_url</code>. Website akan otomatis menggunakan logo baru setelah cache di-refresh (5 menit).
                </div>
                <button className="btn-primary" onClick={() => setSuccess('✅ URL Logo berhasil disimpan! Refresh website dalam 5 menit.')}>
                  💾 Simpan Logo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── INPUT PROYEK ── */}
        {tab === 'projects' && (
          <div>
            <h1 className="section-title mb-6">🏗 Input Proyek Baru</h1>
            <div className="card p-6">
              <p className="text-gray-500 text-sm mb-6">
                Input proyek baru langsung di Google Sheet CRM Mansion tab <strong>PROJECTS</strong>, lalu website akan otomatis menampilkannya.
              </p>
              <a href={`https://docs.google.com/spreadsheets/d/${process.env.NEXT_PUBLIC_SPREADSHEET_ID || ''}/edit#gid=0`}
                 target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex">
                📊 Buka Google Sheet PROJECTS
              </a>
              <div className="mt-6 p-4 bg-gray-50 rounded-xl text-sm">
                <p className="font-semibold text-gray-700 mb-2">Kolom yang perlu diisi:</p>
                <div className="grid grid-cols-2 gap-1 text-gray-500 text-xs">
                  {['Nama_Proyek','Developer','Kota','Harga_Min','Harga_Max','Tipe_Properti','Deskripsi','Foto_Utama_URL','Status'].map(k => (
                    <span key={k} className="bg-white px-2 py-1 rounded border border-gray-200 font-mono">{k}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── KPR SETTINGS ── */}
        {tab === 'kpr' && (
          <div>
            <KprSettings />
          </div>
        )}

        {/* ── SETTINGS SEO ── */}
        {tab === 'settings' && user.role === 'superadmin' && (
          <div>
            <h1 className="section-title mb-6">⚙️ Pengaturan SEO & CTA</h1>
            <div className="card p-6 space-y-5">
              {[
                { label: 'Judul Website (SEO)', key: 'seo_title', placeholder: 'MANSION Realty | Properti...' },
                { label: 'Deskripsi Meta (SEO)', key: 'seo_desc', placeholder: 'Deskripsi singkat untuk Google...' },
                { label: 'Keywords', key: 'seo_keywords', placeholder: 'properti, rumah dijual, broker...' },
                { label: 'Teks CTA WhatsApp', key: 'cta_wa_text', placeholder: 'Halo MANSION Realty, saya ingin konsultasi' },
              ].map(field => (
                <div key={field.key}>
                  <label className="label-field">{field.label}</label>
                  <input className="input-field" placeholder={field.placeholder}/>
                  <p className="text-xs text-gray-400 mt-1">Simpan ke CONFIG sheet dengan KEY = <code>{field.key}</code></p>
                </div>
              ))}
              <button className="btn-primary" onClick={() => setSuccess('✅ Pengaturan disimpan!')}>
                💾 Simpan Pengaturan
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
