import { KPRParams, KPRResult } from '@/types'

export function calculateKPRKonvensional(p: KPRParams): KPRResult {
  const pokok = p.hargaProperti - p.uangMuka
  const bm = p.bungaTahunan / 100 / 12
  const tb = p.tenor * 12
  const angsuran = bm === 0 ? pokok / tb : (pokok * bm * Math.pow(1 + bm, tb)) / (Math.pow(1 + bm, tb) - 1)
  const breakdown: KPRResult['breakdown'] = []
  let sisa = pokok
  for (let i = 1; i <= tb; i++) {
    const bunga = sisa * bm; const pk = angsuran - bunga; sisa -= pk
    breakdown.push({ bulan: i, angsuran: Math.round(angsuran), pokok: Math.round(pk), bunga: Math.round(bunga), sisaPokok: Math.max(0, Math.round(sisa)) })
  }
  const total = angsuran * tb
  return { pokokPinjaman: Math.round(pokok), angsuranPokok: Math.round(pokok/tb), angsuranBunga: Math.round(angsuran-pokok/tb), totalAngsuran: Math.round(angsuran), totalPembayaran: Math.round(total), totalBunga: Math.round(total-pokok), breakdown }
}

export function calculateKPRSyariah(p: KPRParams): KPRResult {
  const pokok = p.hargaProperti - p.uangMuka
  const tb = p.tenor * 12
  const margin = pokok * (p.bungaTahunan / 100) * p.tenor
  const hargaJual = pokok + margin
  const angsuran = hargaJual / tb
  const breakdown: KPRResult['breakdown'] = []
  for (let i = 1; i <= tb; i++) {
    const pk = pokok / tb; const m = margin / tb
    breakdown.push({ bulan: i, angsuran: Math.round(angsuran), pokok: Math.round(pk), bunga: Math.round(m), sisaPokok: Math.round(pokok - pk * i) })
  }
  return { pokokPinjaman: Math.round(pokok), angsuranPokok: Math.round(pokok/tb), angsuranBunga: Math.round(margin/tb), totalAngsuran: Math.round(angsuran), totalPembayaran: Math.round(hargaJual), totalBunga: Math.round(margin), breakdown }
}

export function calculate(p: KPRParams): KPRResult {
  if (p.jenis === 'syariah') return calculateKPRSyariah(p)
  if (p.jenis === 'kmg') return calculateKPRKonvensional({ ...p, bungaTahunan: p.bungaTahunan + 2 })
  return calculateKPRKonvensional(p)
}

export const BANK_PRESETS = [
  { bank: 'BTN',     type: 'konvensional', rate: 7.5,  maxTenor: 30, notes: 'Subsidi FLPP tersedia' },
  { bank: 'BCA',     type: 'konvensional', rate: 7.75, maxTenor: 25, notes: 'Fixed 2 tahun pertama' },
  { bank: 'Mandiri', type: 'konvensional', rate: 7.5,  maxTenor: 30, notes: 'KPR Mandiri Griya' },
  { bank: 'BRI',     type: 'konvensional', rate: 7.25, maxTenor: 30, notes: 'BRI Griya' },
  { bank: 'BSI',     type: 'syariah',      rate: 8.0,  maxTenor: 30, notes: 'Akad Murabahah' },
  { bank: 'BNI Syariah', type: 'syariah', rate: 8.5,  maxTenor: 25, notes: 'Griya iB Hasanah' },
] as const
