'use client'
import LogoBadge from '@/components/ui/LogoBadge'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm]             = useState({ email: '', password: '' })
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [showSetup, setShowSetup]   = useState(false)
  const [setupForm, setSetupForm]   = useState({ setup_secret: '', new_password: '', confirm: '' })
  const [setupMsg, setSetupMsg]     = useState('')
  const [setupLoading, setSetupLoading] = useState(false)

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (setupForm.new_password !== setupForm.confirm) { setSetupMsg('❌ Password tidak cocok'); return }
    setSetupLoading(true); setSetupMsg('')
    try {
      const res  = await fetch('/api/auth/set-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          email:        form.email,
          password:     setupForm.new_password,
          setup_secret: setupForm.setup_secret,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setSetupMsg('✅ Password berhasil diset! Silakan login sekarang.')
        setShowSetup(false)
        setError('')
      } else {
        setSetupMsg('❌ ' + (json.error || 'Gagal'))
      }
    } catch { setSetupMsg('❌ Gagal terhubung') }
    finally { setSetupLoading(false) }
  }

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
            <LogoBadge size="lg" dark={true} />
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

          {setupMsg && (
            <div className={`mt-3 p-3 rounded-xl text-xs ${setupMsg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {setupMsg}
            </div>
          )}

          <div className="mt-4 text-center space-y-2">
            {(error === 'Password salah' || error === 'Email tidak ditemukan') && !showSetup && (
              <button
                type="button"
                onClick={() => setShowSetup(true)}
                className="text-xs text-amber-600 hover:text-amber-800 underline block w-full">
                Belum punya password? Setup password pertama kali
              </button>
            )}
            <Link href="/" className="text-sm text-gray-400 hover:text-primary-900 transition-colors">
              ← Kembali ke Beranda MANSION
            </Link>
          </div>

          {/* Setup Password Form */}
          {showSetup && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-600 mb-3">🔑 Setup Password Pertama Kali</p>
              <p className="text-xs text-gray-400 mb-3">Email yang akan diset: <strong>{form.email || '(isi email dulu)'}</strong></p>
              <form onSubmit={handleSetupPassword} className="space-y-2">
                <input
                  type="password"
                  className="input-field text-sm py-2"
                  placeholder="Setup Secret (tanya admin)"
                  value={setupForm.setup_secret}
                  onChange={e => setSetupForm(p => ({ ...p, setup_secret: e.target.value }))}
                  required
                />
                <input
                  type="password"
                  className="input-field text-sm py-2"
                  placeholder="Password baru (min 6 karakter)"
                  value={setupForm.new_password}
                  onChange={e => setSetupForm(p => ({ ...p, new_password: e.target.value }))}
                  required
                />
                <input
                  type="password"
                  className="input-field text-sm py-2"
                  placeholder="Konfirmasi password"
                  value={setupForm.confirm}
                  onChange={e => setSetupForm(p => ({ ...p, confirm: e.target.value }))}
                  required
                />
                <div className="flex gap-2">
                  <button type="submit" disabled={setupLoading}
                    className="flex-1 py-2 text-sm font-semibold bg-primary-900 text-white rounded-xl disabled:opacity-50">
                    {setupLoading ? '⏳...' : '💾 Set Password'}
                  </button>
                  <button type="button" onClick={() => setShowSetup(false)}
                    className="px-3 py-2 text-sm text-gray-400 border border-gray-200 rounded-xl hover:bg-gray-50">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          © 2026 Mansion Realty. All rights reserved.
        </p>
      </div>
    </div>
  )
}
