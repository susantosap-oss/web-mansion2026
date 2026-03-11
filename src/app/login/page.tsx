'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res  = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()

      if (!json.success) {
        setError(json.error || 'Login gagal')
        return
      }

      // Redirect berdasarkan role
      const role = json.user?.role
      if (role === 'superadmin' || role === 'admin') {
        router.push('/dashboard/admin')
      } else {
        router.push('/dashboard/agent')
      }
    } catch {
      setError('Gagal terhubung ke server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center px-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5" style={{backgroundImage:'repeating-linear-gradient(45deg,#c9a84c 0,#c9a84c 1px,transparent 0,transparent 50%)',backgroundSize:'24px 24px'}}/>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-gold rounded-xl flex items-center justify-center">
              <span className="text-primary-900 font-display font-bold text-2xl">M</span>
            </div>
            <div className="text-left">
              <div className="text-white font-display font-bold text-2xl">Mansion</div>
              <div className="text-gold font-display text-2xl -mt-1">Realty</div>
            </div>
          </Link>
          <p className="text-white/50 text-sm mt-4">Portal Agen & Admin</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <h1 className="font-display font-bold text-primary-900 text-2xl mb-2">Selamat Datang</h1>
          <p className="text-gray-400 text-sm mb-6">Masuk ke dashboard Mansion Realty</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label-field">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="nama@email.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label-field">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Memproses...' : '🔐 Masuk Dashboard'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 mb-3">Role & Akses</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { role: 'Agen', icon: '👤', desc: 'Leads & Pipeline' },
                { role: 'Admin', icon: '⚙️', desc: 'Kelola Konten' },
                { role: 'Superadmin', icon: '👑', desc: 'Full Access' },
              ].map(r => (
                <div key={r.role} className="bg-gray-50 rounded-xl p-2 text-center">
                  <div className="text-lg mb-1">{r.icon}</div>
                  <div className="font-semibold text-primary-900">{r.role}</div>
                  <div className="text-gray-400 text-xs">{r.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-400 hover:text-primary-900 transition-colors">
              ← Kembali ke Website
            </Link>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          © 2026 Mansion Realty. All rights reserved.
        </p>
      </div>
    </div>
  )
}
