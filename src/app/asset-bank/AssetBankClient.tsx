'use client'
import { useState, useMemo } from 'react'
import Image from 'next/image'
import { AssetBank } from '@/types'
import { formatPrice } from '@/lib/sheets'

const FALLBACK_IMG: Record<string, string> = {
  'Rumah':     '/assets/Rumah.png',
  'Ruko':      '/assets/Ruko.png',
  'Apartemen': '/assets/apartemen.png',
  'Gedung':    '/assets/gedung.png',
  'Gudang':    '/assets/gudang.png',
  'Kavling':   '/assets/kavling.png',
  'Tanah':     '/assets/kavling.png',
}

function getFallbackImg(tipe: string): string {
  return FALLBACK_IMG[tipe] || FALLBACK_IMG['Rumah']
}

const WA_ADMIN = '6281703133252'

function buildWAAsset(asset: AssetBank): string {
  const msg = `Halo Admin Mansion Realty, saya tertarik dengan Asset Bank berikut:\n\n🏦 *${asset.namaBank}*\n🏠 ${asset.judul}\n📍 ${[asset.kecamatan, asset.kota].filter(Boolean).join(', ')}\n💰 ${formatPrice(asset.harga)}\n\nMohon info lebih lanjut. Terima kasih.`
  return `https://wa.me/${WA_ADMIN}?text=${encodeURIComponent(msg)}`
}

const JENIS_BADGE: Record<AssetBank['jenisAsset'], { label: string; cls: string }> = {
  'Lelang':  { label: '🔨 Lelang',  cls: 'bg-red-600 text-white' },
  'Cessie':  { label: '🏦 Cessie',  cls: 'bg-blue-700 text-white' },
  'AYDA':    { label: '🏦 AYDA',    cls: 'bg-indigo-700 text-white' },
  'Lainnya': { label: 'Asset Bank', cls: 'bg-gray-700 text-white' },
}

function AssetCard({ asset }: { asset: AssetBank }) {
  const waHref = buildWAAsset(asset)
  const badge  = JENIS_BADGE[asset.jenisAsset]

  return (
    <div className="card group property-card">
      {/* Gambar */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={asset.coverImage || getFallbackImg(asset.tipeProperti)}
          alt={asset.judul}
          fill
          className="object-cover property-image"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <span className={`badge text-xs font-bold ${badge.cls}`}>{badge.label}</span>
          {asset.namaBank && (
            <span className="badge bg-white/90 text-primary-900 text-xs font-semibold">{asset.namaBank}</span>
          )}
        </div>
        {asset.tanggalLelang && asset.jenisAsset === 'Lelang' && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-700/80 px-3 py-1.5">
            <p className="text-white text-xs font-semibold">📅 Lelang: {asset.tanggalLelang}</p>
          </div>
        )}
      </div>

      {/* Konten */}
      <div className="p-4">
        {asset.mapsUrl ? (
          <a href={asset.mapsUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs text-primary-700 hover:text-primary-900 underline underline-offset-2 mb-1 block">
            📍 {[asset.kecamatan, asset.kota].filter(Boolean).join(', ') || '-'}
          </a>
        ) : (
          <p className="text-xs text-gray-600 mb-1">
            📍 {[asset.kecamatan, asset.kota].filter(Boolean).join(', ') || '-'}
          </p>
        )}
        <h3 className="font-display font-semibold text-primary-900 line-clamp-2 leading-snug">
          {asset.judul}
        </h3>
        {asset.kodeAsset && (
          <p className="text-xs text-gray-400 mt-0.5 mb-2">{asset.kodeAsset}</p>
        )}
        <div className="mb-3">
          <p className="text-xs text-gray-500 font-medium">Harga Limit</p>
          <p className="price-display">{formatPrice(asset.harga)}</p>
        </div>

        {/* Specs */}
        {(asset.luasTanah > 0 || asset.luasBangunan > 0 || asset.sertifikat) && (
          <div className="flex gap-3 text-xs text-gray-600 border-t border-gray-100 pt-3 mb-3 flex-wrap">
            {asset.luasTanah    > 0 && <span>🏠 LT {asset.luasTanah}m²</span>}
            {asset.luasBangunan > 0 && <span>📐 LB {asset.luasBangunan}m²</span>}
            {asset.sertifikat        && <span>📄 {asset.sertifikat}</span>}
          </div>
        )}

        {asset.deskripsi && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{asset.deskripsi}</p>
        )}

        <div className="flex gap-2">
          {asset.mapsUrl && (
            <a href={asset.mapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-primary-900 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors whitespace-nowrap">
              📍 Lihat MAP
            </a>
          )}
          <a href={waHref} target="_blank" rel="noopener noreferrer"
            className={`${asset.mapsUrl ? 'flex-1' : 'w-full'} block text-center py-2.5 text-sm font-semibold text-white bg-[#0f7266] rounded-lg hover:bg-[#0e6b5e] transition-colors`}>
            💬 Tanya Admin via WA
          </a>
        </div>
      </div>
    </div>
  )
}

const PER_PAGE = 24

export default function AssetBankClient({ assets }: { assets: AssetBank[] }) {
  const [filterKota,  setFilterKota]  = useState('')
  const [filterBank,  setFilterBank]  = useState('')
  const [filterJenis, setFilterJenis] = useState('')
  const [page, setPage] = useState(1)

  const resetPage = () => setPage(1)

  // Opsi unik untuk setiap filter
  const kotaList  = useMemo(() => [...new Set(assets.map(a => a.kota).filter(Boolean))].sort(), [assets])
  const bankList  = useMemo(() => [...new Set(assets.map(a => a.namaBank).filter(Boolean))].sort(), [assets])
  const jenisList: AssetBank['jenisAsset'][] = ['Lelang', 'Cessie', 'AYDA', 'Lainnya']

  const filtered = useMemo(() => assets.filter(a => {
    if (filterKota  && a.kota       !== filterKota)  return false
    if (filterBank  && a.namaBank   !== filterBank)  return false
    if (filterJenis && a.jenisAsset !== filterJenis) return false
    return true
  }), [assets, filterKota, filterBank, filterJenis])

  const sorted = useMemo(() =>
    [...filtered].sort((a, b) => {
      const aHasPhoto = a.coverImage?.startsWith('http') ? 1 : 0
      const bHasPhoto = b.coverImage?.startsWith('http') ? 1 : 0
      return bHasPhoto - aHasPhoto
    })
  , [filtered])

  const totalPages = Math.ceil(sorted.length / PER_PAGE)
  const paginated  = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const hasFilter  = filterKota || filterBank || filterJenis

  return (
    <>
      {/* Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Filter Kota */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-gray-500 font-medium mb-1">Kota</label>
            <select
              value={filterKota}
              onChange={e => { setFilterKota(e.target.value); resetPage() }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400">
              <option value="">Semua Kota</option>
              {kotaList.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          {/* Filter Nama Bank */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-gray-500 font-medium mb-1">Nama Bank</label>
            <select
              value={filterBank}
              onChange={e => { setFilterBank(e.target.value); resetPage() }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400">
              <option value="">Semua Bank</option>
              {bankList.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Filter Jenis Asset */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-gray-500 font-medium mb-1">Jenis Asset</label>
            <select
              value={filterJenis}
              onChange={e => { setFilterJenis(e.target.value); resetPage() }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400">
              <option value="">Semua Jenis</option>
              {jenisList.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>

          {/* Reset */}
          {hasFilter && (
            <button
              onClick={() => { setFilterKota(''); setFilterBank(''); setFilterJenis(''); resetPage() }}
              className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap">
              ✕ Reset
            </button>
          )}
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          {filtered.length} asset ditemukan
          {hasFilter && ` (dari ${assets.length} total)`}
          {totalPages > 1 && ` — halaman ${page} dari ${totalPages}`}
        </p>
      </div>

      {/* Grid Cards */}
      {paginated.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map(a => <AssetCard key={a.id || a.judul} asset={a}/>)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                ← Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = totalPages <= 7 ? i + 1
                  : page <= 4 ? i + 1
                  : page >= totalPages - 3 ? totalPages - 6 + i
                  : page - 3 + i
                return (
                  <button key={p} onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    className={`w-9 h-9 text-sm font-semibold rounded-lg transition-colors ${page === p ? 'bg-primary-900 text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-700'}`}>
                    {p}
                  </button>
                )
              })}
              <button
                onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Next →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🏦</div>
          <h3 className="font-display font-bold text-primary-900 text-xl mb-2">
            {assets.length === 0 ? 'Belum ada Asset Bank tersedia' : 'Asset tidak ditemukan'}
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            {assets.length === 0
              ? 'Data asset akan muncul setelah di-Publish di CRM.'
              : 'Coba ubah filter pencarian Anda.'}
          </p>
          {hasFilter && (
            <button
              onClick={() => { setFilterKota(''); setFilterBank(''); setFilterJenis(''); resetPage() }}
              className="btn-primary mt-2">
              Lihat Semua Asset
            </button>
          )}
        </div>
      )}

      {/* CTA Kontak Admin */}
      <div className="mt-12 bg-primary-900 rounded-2xl p-6 md:p-8 text-center">
        <p className="text-gold font-semibold text-sm mb-2">Butuh informasi lebih lanjut?</p>
        <h3 className="font-display font-bold text-white text-xl mb-3">
          Hubungi Admin Kantor Mansion Realty
        </h3>
        <p className="text-white/70 text-sm mb-5">
          Tim kami siap membantu proses pengecekan, negosiasi, dan administrasi asset bank.
        </p>
        <a
          href={`https://wa.me/${WA_ADMIN}?text=${encodeURIComponent('Halo Admin Mansion Realty, saya ingin tanya mengenai Asset Bank yang tersedia. Mohon informasinya. Terima kasih.')}`}
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#1ebd5a] transition-colors text-sm">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          💬 Hubungi Admin
        </a>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 border border-gray-200 rounded-xl p-4 bg-gray-50">
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="font-semibold text-gray-600">Disclaimer:</span> Nama bank atau lembaga keuangan ditampilkan hanya sebagai informasi asal atau pemilik aset. Seluruh data disajikan dengan itikad baik dan dapat berubah sewaktu-waktu. Website ini bukan merupakan perwakilan atau afiliasi resmi dari bank yang disebutkan, kecuali dinyatakan secara eksplisit.
        </p>
      </div>
    </>
  )
}
