'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'

export default function LogoUpload() {
  const [preview,   setPreview]   = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [savedUrl,  setSavedUrl]  = useState<string>('')
  const [msg,       setMsg]       = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const CLOUD_NAME     = 'dqiqatpac'
  const UPLOAD_PRESET  = 'crm_unsigned'

  // Preview saat pilih file
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validasi tipe & ukuran
    if (!file.type.startsWith('image/')) {
      setMsg('❌ File harus berupa gambar (JPG, PNG, SVG)')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setMsg('❌ Ukuran file maksimal 2MB')
      return
    }

    // Preview lokal
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    setMsg('')
  }

  // Upload ke Cloudinary
  async function handleUpload() {
    const file = fileRef.current?.files?.[0]
    if (!file) { setMsg('❌ Pilih file dulu'); return }
    if (!CLOUD_NAME) { setMsg('❌ CLOUDINARY_CLOUD_NAME belum diset di .env.local'); return }

    setUploading(true)
    setMsg('')

    try {
      const formData = new FormData()
      formData.append('file',         file)
      formData.append('upload_preset', UPLOAD_PRESET)
      formData.append('folder',        'mansion-realty/logos')
      formData.append('public_id',     `logo_${Date.now()}`)

      const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body:   formData,
      })
      const json = await res.json()

      if (json.secure_url) {
        setSavedUrl(json.secure_url)
        // Simpan ke CONFIG via API
        await saveConfig(json.secure_url)
      } else {
        throw new Error(json.error?.message || 'Upload gagal')
      }
    } catch (e: any) {
      setMsg(`❌ ${e.message}`)
    } finally {
      setUploading(false)
    }
  }

  // Simpan URL ke sheet CONFIG
  async function saveConfig(url: string) {
    try {
      const res  = await fetch('/api/config', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ key: 'logo_url', value: url }),
      })
      const json = await res.json()
      setMsg(json.gasSaved
        ? '✅ Logo berhasil diupload & disimpan ke Google Sheet!'
        : '✅ Logo berhasil diupload! (Tersimpan sementara — tambahkan saveConfig di GAS untuk permanen)'
      )
    } catch {
      setMsg('✅ Logo diupload ke Cloudinary tapi gagal simpan config')
    }
  }

  // Atau simpan URL manual
  async function handleSaveManualUrl() {
    if (!savedUrl && !preview) { setMsg('❌ Upload file atau input URL dulu'); return }
    await saveConfig(savedUrl || preview)
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-primary-900 mb-1">🖼 Ganti Logo</h1>
      <p className="text-sm text-gray-400 mb-6">Upload logo dari komputer dan simpan ke Cloudinary</p>

      {msg && (
        <div className={`mb-4 p-3 rounded-xl text-sm ${msg.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">

        {/* Upload Area */}
        <div className="card p-6">
          <p className="text-sm font-semibold text-gray-600 mb-4">Upload dari Komputer</p>

          {/* Drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 hover:border-primary-400 rounded-2xl p-8 text-center cursor-pointer transition-colors mb-4 group"
          >
            {preview ? (
              <div className="flex flex-col items-center gap-3">
                <img src={preview} alt="preview" className="h-24 w-auto object-contain rounded-lg shadow"/>
                <p className="text-xs text-gray-400">Klik untuk ganti file</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-primary-700 transition-colors">
                <span className="text-4xl">🖼</span>
                <p className="text-sm font-semibold">Klik atau drop file di sini</p>
                <p className="text-xs">PNG, JPG, SVG — Maks 2MB</p>
              </div>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={handleUpload}
            disabled={uploading || !preview}
            className="btn-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? '⏳ Mengupload...' : '☁️ Upload ke Cloudinary & Simpan'}
          </button>
        </div>

        {/* Preview & Current */}
        <div className="card p-6">
          <p className="text-sm font-semibold text-gray-600 mb-4">Logo Saat Ini</p>

          {/* Default logo */}
          <div className="bg-primary-900 rounded-xl p-6 flex items-center justify-center mb-4">
            {savedUrl ? (
              <img src={savedUrl} alt="Logo baru" className="h-16 w-auto object-contain"/>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gold rounded-xl flex items-center justify-center">
                  <span className="text-primary-900 font-bold text-2xl">M</span>
                </div>
                <div>
                  <span className="text-white font-bold text-xl">Mansion</span>
                  <span className="text-gold font-bold text-xl ml-1">Realty</span>
                </div>
              </div>
            )}
          </div>

          {savedUrl && (
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <p className="text-xs text-gray-400 mb-1">URL Cloudinary:</p>
              <p className="text-xs text-primary-900 font-mono break-all">{savedUrl}</p>
            </div>
          )}

          {/* Input URL manual */}
          <div className="border-t border-gray-100 pt-4 mt-2">
            <p className="text-xs text-gray-400 mb-2">Atau input URL Cloudinary manual:</p>
            <input
              type="text"
              className="input-field text-sm mb-2"
              placeholder="https://res.cloudinary.com/..."
              value={savedUrl}
              onChange={e => setSavedUrl(e.target.value)}
            />
            <button
              onClick={handleSaveManualUrl}
              className="w-full py-2 text-sm font-semibold border border-primary-900 text-primary-900 rounded-xl hover:bg-primary-50 transition-colors"
            >
              💾 Simpan URL Manual
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 p-4 bg-blue-50 rounded-xl text-xs text-blue-700 space-y-1">
        <p>💡 <strong>Cloudinary Cloud Name:</strong> {CLOUD_NAME || '⚠️ Belum diset di .env.local'}</p>
        <p>💡 <strong>Upload Preset:</strong> {UPLOAD_PRESET} (harus Unsigned di Cloudinary Dashboard)</p>
        <p>💡 Logo tersimpan di CONFIG sheet dengan KEY = <code>logo_url</code></p>
      </div>
    </div>
  )
}
