'use client'
import { useState } from 'react'

export default function TitipListingPage() {
  const [form, setForm] = useState({ name:'', phone:'', email:'', propertyType:'Rumah', address:'', price:'', description:'' })
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const wa = process.env.NEXT_PUBLIC_WA_OFFICE || '6281234567890'

  const handleWA = async () => {
    if (!form.name || !form.phone) return
    setLoading(true)
    // Simpan lead ke GSheet sebagai SSoT
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:         form.name,
          phone:        form.phone,
          email:        form.email,
          message:      `Titip Listing: ${form.propertyType} di ${form.address}. Harga: ${form.price}. ${form.description}`,
          source:       'TitipListing',
          listingTitle: `${form.propertyType} di ${form.address}`,
          tipeProperti: form.propertyType,
          jenis:        'Titip',
          minatTipe:    'Titip/Jual',
          lokasi:       form.address,
          budgetMin:    form.price,
          budgetMax:    form.price,
        }),
      })
    } catch { /* tetap lanjut ke WA meski leads gagal disimpan */ }
    setLoading(false)
    const msg = `*Titip Listing Properti*\n\nNama: ${form.name}\nTelepon: ${form.phone}\nTipe: ${form.propertyType}\nAlamat: ${form.address}\nHarga: ${form.price}\nDeskripsi: ${form.description}`
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank')
    setDone(true)
  }

  return (
    <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
      <div className="section-wrapper max-w-2xl">
        <div className="text-center mb-8"><div className="divider-gold mx-auto mb-3"/><h1 className="section-title">Titip Listing Properti</h1><p className="section-subtitle mx-auto">Percayakan penjualan properti Anda kepada agen profesional Mansion Realty</p></div>
        {!done ? (
          <div className="card p-8 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label-field">Nama Lengkap *</label><input className="input-field" placeholder="John Doe" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
              <div><label className="label-field">No. WhatsApp *</label><input className="input-field" placeholder="08123456789" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}/></div>
            </div>
            <div><label className="label-field">Email</label><input type="email" className="input-field" placeholder="john@email.com" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/></div>
            <div><label className="label-field">Tipe Properti *</label>
              <select className="input-field" value={form.propertyType} onChange={e=>setForm(p=>({...p,propertyType:e.target.value}))}>
                {['Rumah','Apartemen','Ruko','Kavling','Gedung','Gudang','Lainnya'].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="label-field">Alamat / Lokasi *</label><input className="input-field" placeholder="Jl. Contoh No. 1, Jakarta Selatan" value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))}/></div>
            <div><label className="label-field">Harga yang Diinginkan</label><input className="input-field" placeholder="cth: 850.000.000" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))}/></div>
            <div><label className="label-field">Deskripsi Singkat</label><textarea className="input-field h-28 resize-none" placeholder="Kondisi properti, spesifikasi, dll..." value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}/></div>
            <button onClick={handleWA} disabled={loading || !form.name || !form.phone} className="btn-wa w-full justify-center py-4 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Menyimpan...' : '💬 Kirim via WhatsApp'}</button>
          </div>
        ) : (
          <div className="card p-12 text-center"><div className="text-6xl mb-4">✅</div><h2 className="font-display font-bold text-primary-900 text-2xl mb-3">Terima Kasih!</h2><p className="text-gray-600 mb-6">Tim agen kami akan segera menghubungi Anda.</p><button onClick={()=>setDone(false)} className="btn-outline">Titip Lagi</button></div>
        )}
      </div>
    </div>
  )
}
