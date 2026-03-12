'use client'
import LogoBadge from '@/components/ui/LogoBadge'
import LogoUpload from './LogoUpload'
import KprSettings from './KprSettings'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthUser } from '@/lib/auth'

interface Props { user: AuthUser }

type Tab = 'overview' | 'news' | 'logo' | 'settings' | 'kpr'

export default function AdminDashboardClient({ user }: Props) {
  const router = useRouter()
  const [tab, setTab]         = useState<Tab>('overview')
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState('')

  // Form states (Original GitHub)
  const [newsForm, setNewsForm] = useState({ judul: '', ringkasan: '', konten: '', kategori: 'Berita Properti', foto_url: '' })
  const [logoUrl, setLogoUrl]   = useState('')

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

  const menuItems: Array<{ id: Tab; icon: string; label: string; roles: string[] }> = [
    { id: 'overview',  icon: '📊', label: 'Overview',        roles: ['admin','superadmin'] },
    { id: 'news',      icon: '📰', label: 'Input Berita',    roles: ['admin','superadmin'] },
    { id: 'logo',      icon: '🖼',  label: 'Ganti Logo',     roles: ['superadmin'] },
    { id: 'kpr',       icon: '🏦', label: 'Setting KPR',    roles: ['admin','superadmin'] },
    { id: 'settings',  icon: '⚙️', label: 'Pengaturan SEO', roles: ['superadmin'] },
  ].filter(m => m.roles.includes(user.role))

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar (Original GitHub) */}
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
      <div className="md:ml-64 flex-1 p-6 pt-8">

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


        {/* ── GANTI LOGO ── */}
        {tab === 'logo' && (
          <div><LogoUpload /></div>
        )}



        {/* ── KPR SETTINGS (ORIGINAL) ── */}
        {tab === 'kpr' && <KprSettings />}

        {/* ── SETTINGS SEO (KEMBALI KE ORIGINAL) ── */}
        {tab === 'settings' && user.role === 'superadmin' && (
          <div>
            <h1 className="section-title mb-6">⚙️ Pengaturan SEO & CTA</h1>
            <div className="card p-6 space-y-5">
              {[
                { label: 'Judul Website (SEO)', key: 'seo_title' },
                { label: 'Deskripsi Meta (SEO)', key: 'seo_desc' },
                { label: 'Keywords', key: 'seo_keywords' },
              ].map(field => (
                <div key={field.key}>
                  <label className="label-field">{field.label}</label>
                  <input className="input-field" placeholder="Masukkan nilai..."/>
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
