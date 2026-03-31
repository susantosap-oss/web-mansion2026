'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/sheets'
import { Project, Agent } from '@/types'

function roleLabel(role: string | undefined): string {
  const r = (role || '').toLowerCase()
  if (r === 'koordinator' || r === 'coordinator' || r === 'koord') return 'Koordinator'
  if (r === 'business_manager' || r === 'bm' || r === 'businessmanager' || r === 'business manager' || r === 'manager') return 'Business Manager'
  if (r === 'principal') return 'Principal'
  return 'Agen'
}

interface Props {
  project:  Project
  agents:   Agent[]
  waKantor: string
}

export default function ProjectDetailClient({ project, agents, waKantor }: Props) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showForm, setShowForm]           = useState(false)
  const [name, setName]                   = useState('')
  const [phone, setPhone]                 = useState('')
  const [sending, setSending]             = useState(false)
  const [sent, setSent]                   = useState(false)

  const handlePilih = (agent: Agent) => {
    setSelectedAgent(agent)
    setShowForm(true)
  }

  const buildWaLink = (agent: Agent) => {
    const num = (agent.whatsapp || agent.phone || '').replace(/\D/g, '')
    const normalized = num.startsWith('0') ? '62' + num.slice(1) : num.startsWith('62') ? num : '62' + num
    const msg = `Halo ${agent.name}, saya tertarik dengan proyek *${project.name}*.\nHarga mulai: ${formatPrice(project.priceMin)}\n\nBisa info lebih lanjut?`
    return normalized
      ? `https://wa.me/${normalized}?text=${encodeURIComponent(msg)}`
      : `${waKantor}?text=${encodeURIComponent(msg)}`
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
          listingId:    project.id,
          listingTitle: project.name,
          agentId:      selectedAgent?.id || project.agentId || '',
          message:      `Tertarik proyek: ${project.name} — Harga mulai ${formatPrice(project.priceMin)}`,
          source:       'Web-Proyek',
          tipeProperti: project.type,
          jenis:        'Primary',
          minatTipe:    'Proyek Baru',
          lokasi:       [project.location, project.city].filter(Boolean).join(', '),
          budgetMin:    project.priceMin || '',
          budgetMax:    project.priceMax || '',
        }),
      })
    } catch { /* tetap buka WA */ }
    setSending(false)
    setSent(true)
    window.open(selectedAgent ? buildWaLink(selectedAgent) : waKantor, '_blank')
  }

  return (
    <div className="sticky top-24 space-y-4">

      {/* Agent Picker */}
      <div className="card p-5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Hubungi Agen
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Pilih agen — diurutkan berdasarkan sertifikasi, listing &amp; aktivitas CRM
        </p>

        {!sent ? (
          !showForm ? (
            /* Daftar agen */
            <div className="space-y-2">
              {agents.length === 0 ? (
                <button
                  onClick={() => { setSelectedAgent(null); setShowForm(true) }}
                  className="btn-wa w-full justify-center py-3">
                  💬 Chat WhatsApp Agen
                </button>
              ) : (
                agents.map((agent, idx) => (
                    <button
                      key={agent.id}
                      onClick={() => handlePilih(agent)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gold hover:bg-amber-50 transition-all text-left group">
                      {/* Rank */}
                      <span className={`text-xs font-bold w-6 text-center flex-shrink-0 ${
                        idx === 0 ? 'text-yellow-500' :
                        idx === 1 ? 'text-gray-400' :
                        idx === 2 ? 'text-orange-500' : 'text-gray-300'
                      }`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx+1}`}
                      </span>
                      {/* Foto */}
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-primary-100 flex-shrink-0 flex items-center justify-center">
                        {agent.photo ? (
                          <Image src={agent.photo} alt={agent.name} width={36} height={36} className="object-cover w-full h-full"/>
                        ) : (
                          <span className="text-primary-900 font-bold text-sm">{agent.name.charAt(0)}</span>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-primary-900 text-sm truncate">{agent.name}</p>
                        <p className="text-xs text-gray-400">{roleLabel(agent.role)} · {agent.city || 'Surabaya'}</p>
                      </div>
                      {/* Arrow */}
                      <span className="text-gray-300 group-hover:text-gold text-sm">→</span>
                    </button>
                  ))
              )}
              <Link href="/agents?sort=top"
                className="block text-center text-xs text-gray-400 hover:text-primary-900 transition-colors pt-1">
                Lihat semua top agen →
              </Link>
            </div>
          ) : (
            /* Form setelah pilih agen */
            <div className="space-y-3">
              {selectedAgent && (
                <div className="flex items-center gap-2 p-2.5 bg-amber-50 rounded-xl border border-gold/30">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 flex-shrink-0 flex items-center justify-center">
                    {selectedAgent.photo ? (
                      <Image src={selectedAgent.photo} alt={selectedAgent.name} width={32} height={32} className="object-cover w-full h-full"/>
                    ) : (
                      <span className="text-primary-900 font-bold text-xs">{selectedAgent.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-primary-900 truncate">{selectedAgent.name}</p>
                    <p className="text-xs text-gray-400">{roleLabel(selectedAgent.role)} · {selectedAgent.city || 'Surabaya'}</p>
                  </div>
                  <button onClick={() => setShowForm(false)} className="text-xs text-gray-400 hover:text-gray-600">Ganti</button>
                </div>
              )}
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
              <button
                onClick={handleContact}
                disabled={sending || !name.trim() || !phone.trim()}
                className="btn-wa w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                {sending ? 'Menyimpan...' : '💬 Hubungi via WhatsApp'}
              </button>
              <button onClick={() => setShowForm(false)}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 py-1">
                ← Kembali pilih agen
              </button>
            </div>
          )
        ) : (
          /* Setelah submit */
          <div className="text-center py-2">
            <p className="text-sm text-green-600 font-semibold">✅ Data tersimpan!</p>
            <p className="text-xs text-gray-400 mt-1 mb-3">Agen akan segera menghubungi Anda</p>
            <button
              onClick={() => window.open(selectedAgent ? buildWaLink(selectedAgent) : waKantor, '_blank')}
              className="btn-wa w-full justify-center py-3">
              💬 Buka WhatsApp Lagi
            </button>
            <button onClick={() => { setSent(false); setShowForm(false); setName(''); setPhone('') }}
              className="block w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-2">
              Hubungi agen lain
            </button>
          </div>
        )}
      </div>

      {/* KPR */}
      <div className="card p-5 bg-amber-50">
        <p className="text-sm font-semibold text-primary-900 mb-2">💰 Simulasi KPR</p>
        <Link
          href={`/calculator?harga=${project.priceMin}&from=${encodeURIComponent('/projects/' + project.slug)}`}
          className="btn-primary w-full justify-center text-sm py-2.5">
          Hitung Cicilan
        </Link>
      </div>

    </div>
  )
}
