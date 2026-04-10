'use client'
import { useState } from 'react'
import { Agent } from '@/types'
import { buildWALink } from '@/lib/sheets'

interface Props {
  agent:     Agent
  agentUrl:  string
  waKantor:  string
}

export default function AgentProfileClient({ agent, agentUrl, waKantor }: Props) {
  const [copied,   setCopied]   = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [name,     setName]     = useState('')
  const [phone,    setPhone]    = useState('')
  const [sending,  setSending]  = useState(false)
  const [sent,     setSent]     = useState(false)

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(agentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      prompt('Copy URL profil agen:', agentUrl)
    }
  }

  const handleShareWa = () => {
    const msg = `Halo! Kenali agen properti kami:\n*${agent.name}*\n${agentUrl}`
    const num  = (agent.whatsapp || agent.phone || '').replace(/\D/g, '')
    const url  = num
      ? buildWALink(num, msg)
      : `https://wa.me/?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  const handleContact = async () => {
    if (!name.trim() || !phone.trim()) return
    setSending(true)
    try {
      await fetch('/api/leads', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:         name.trim(),
          phone:        phone.trim(),
          agentId:      agent.id,
          listingTitle: '',
          message:      `Konsultasi agen: ${agent.name}`,
          source:       'Web',
          minatTipe:    'Konsultasi',
          jenis:        '',
          tipeProperti: '',
          lokasi:       agent.city || '',
        }),
      })
    } catch { /* tetap buka WA */ }
    setSending(false)
    setSent(true)
    const num = (agent.whatsapp || agent.phone || '').replace(/\D/g, '')
    const msg = `Halo ${agent.name}, saya ingin konsultasi properti.`
    window.open(num ? buildWALink(num, msg) : waKantor, '_blank')
  }

  return (
    <div className="flex flex-wrap gap-3">
      {/* Tombol hubungi via WA */}
      {!sent ? (
        !showForm ? (
          <button onClick={() => setShowForm(true)}
            className="btn-wa px-5 py-2.5 text-sm">
            💬 Hubungi via WA
          </button>
        ) : (
          <div className="w-full space-y-2">
            <p className="text-xs text-gray-500 font-medium">Masukkan data Anda:</p>
            <input
              className="input-field text-sm py-2"
              placeholder="Nama Lengkap *"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
            <input
              className="input-field text-sm py-2"
              placeholder="No. WhatsApp *"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleContact}
                disabled={sending || !name.trim() || !phone.trim()}
                className="btn-wa px-5 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {sending ? 'Menyimpan...' : '💬 Lanjut ke WA'}
              </button>
              <button onClick={() => setShowForm(false)}
                className="text-sm text-gray-400 hover:text-gray-600 px-3">
                Batal
              </button>
            </div>
          </div>
        )
      ) : (
        <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
          ✅ Data tersimpan!
        </div>
      )}

      {/* Copy URL profil */}
      <button onClick={handleCopyUrl}
        className="px-4 py-2.5 text-sm font-semibold border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
        {copied ? '✅ Link Disalin!' : '🔗 Copy Profil URL'}
      </button>

      {/* Share via WA */}
      <button onClick={handleShareWa}
        className="px-4 py-2.5 text-sm font-semibold border border-[#128C7E]/30 text-[#128C7E] rounded-xl hover:bg-[#f0faf8] transition-colors">
        📤 Share via WA
      </button>
    </div>
  )
}
