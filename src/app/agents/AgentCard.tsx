'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Agent } from '@/types'

function roleLabel(role: string | undefined): string {
  const r = (role || '').toLowerCase()
  if (r === 'koordinator' || r === 'coordinator' || r === 'koord') return 'Koordinator'
  if (r === 'business_manager' || r === 'bm' || r === 'businessmanager' || r === 'business manager' || r === 'manager') return 'Business Manager'
  if (r === 'principal') return 'Principal'
  return 'Agen'
}

interface Props {
  agent:     Agent
  idx:       number
  sort:      string
  waKantor:  string
}

export default function AgentCard({ agent, idx, sort, waKantor }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [name,     setName]     = useState('')
  const [phone,    setPhone]    = useState('')
  const [sending,  setSending]  = useState(false)
  const [sent,     setSent]     = useState(false)

  const convRate = agent.totalListings > 0
    ? ((agent.totalDeals / agent.totalListings) * 100).toFixed(0)
    : '0'

  const buildWaLink = () => {
    const num = (agent.whatsapp || agent.phone || '').replace(/\D/g, '')
    const msg = `Halo ${agent.name}, saya ingin konsultasi properti.`
    const target = num ? `https://wa.me/${num}?text=${encodeURIComponent(msg)}` : waKantor
    return target
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
          lokasi:       '',
        }),
      })
    } catch { /* tetap buka WA */ }
    setSending(false)
    setSent(true)
    window.open(buildWaLink(), '_blank')
  }

  return (
    <div className="card p-5 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
      {/* Rank badge */}
      {sort === 'top' && (
        <div className="flex justify-end mb-2">
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            idx === 0 ? 'bg-yellow-100 text-yellow-700' :
            idx === 1 ? 'bg-gray-100 text-gray-600' :
            idx === 2 ? 'bg-orange-100 text-orange-700' :
            'bg-blue-50 text-blue-600'
          }`}>
            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx+1}`}
          </span>
        </div>
      )}

      {/* Photo */}
      <div className="flex flex-col items-center text-center mb-4">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center mb-3 border-4 border-white shadow-md">
          {agent.photo ? (
            <Image src={agent.photo} alt={agent.name} width={80} height={80} className="object-cover w-full h-full"/>
          ) : (
            <span className="text-primary-900 font-bold text-2xl">{agent.name.charAt(0)}</span>
          )}
        </div>
        <h3 className="font-bold text-primary-900">{agent.name}</h3>
        <p className="text-xs text-gray-400">{roleLabel(agent.role)} · {agent.city || 'Surabaya'}</p>
        {agent.nomerLsp && (
          <p className="text-xs text-primary-700 font-medium mt-0.5">LSP: {agent.nomerLsp}</p>
        )}
        {agent.sertifikasi && (
          <p className="text-xs text-blue-700 font-medium mt-0.5">Sert: {agent.sertifikasi}</p>
        )}
        {agent.nomerCra && (
          <p className="text-xs text-purple-700 font-medium mt-0.5">CRA: {agent.nomerCra}</p>
        )}
        {agent.verified && (
          <span className="mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
            ✓ Terverifikasi
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label:'Listing', value: agent.totalListings },
          { label:'Deal',    value: agent.totalDeals },
          { label:'Konversi',value: `${convRate}%` },
        ].map(s => (
          <div key={s.label} className="bg-gray-50 rounded-xl p-2 text-center">
            <div className="font-bold text-primary-900 text-sm">{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* WA Button with lead capture */}
      {!sent ? (
        !showForm ? (
          <button onClick={() => setShowForm(true)}
            className="btn-wa w-full justify-center py-2.5 text-sm">
            💬 Hubungi via WA
          </button>
        ) : (
          <div className="space-y-2">
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
              className="btn-wa w-full justify-center py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {sending ? 'Menyimpan...' : '💬 Lanjut ke WhatsApp'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-600 py-1">
              Batal
            </button>
          </div>
        )
      ) : (
        <div className="text-center py-1">
          <p className="text-xs text-green-600 font-semibold mb-2">✅ Data tersimpan!</p>
          <button onClick={() => window.open(buildWaLink(), '_blank')}
            className="btn-wa w-full justify-center py-2.5 text-sm">
            💬 Buka WhatsApp Lagi
          </button>
        </div>
      )}
    </div>
  )
}
