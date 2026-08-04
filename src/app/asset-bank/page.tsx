import type { Metadata } from 'next'
import { getAssets } from '@/lib/sheets'
import AssetBankClient from './AssetBankClient'
import WhatsAppButton from '@/components/ui/WhatsAppButton'

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mansionpro.id'

export const metadata: Metadata = {
  title: 'Asset Bank — Lelang & Cessie/AYDA | Mansion Realty',
  description: 'Daftar asset bank lelang dan Cessie/AYDA di Surabaya, Gresik, Sidoarjo, dan sekitarnya. Properti hasil lelang bank dan AYDA dari berbagai bank. Hubungi admin Mansion Realty untuk info lengkap.',
  alternates: { canonical: `${BASE}/asset-bank` },
  openGraph: {
    title: 'Asset Bank — Lelang & Cessie/AYDA | Mansion Realty',
    description: 'Properti asset bank lelang dan Cessie/AYDA. Konsultasi gratis dengan admin Mansion Realty.',
    url: `${BASE}/asset-bank`,
    type: 'website',
  },
}

export default async function AssetBankPage() {
  const assets = await getAssets()

  return (
    <>
      <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
        <div className="section-wrapper">

          {/* Header */}
          <div className="mb-8">
            <div className="divider-gold mb-3"/>
            <h1 className="section-title">Asset Bank</h1>
            <p className="text-gray-500 mt-2 max-w-2xl">
              Properti hasil Lelang Bank, Cessie, dan AYDA dari berbagai bank.
            </p>
          </div>

          {/* Info Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: '🔨', label: 'Lelang',      desc: 'Aset lelang bank dengan harga limit resmi' },
              { icon: '🏦', label: 'Cessie / AYDA', desc: 'Agunan Yang Diambil Alih oleh bank' },
              { icon: '📋', label: 'Diverifikasi', desc: 'Verifikasi Data berdasarkan data dari pihak Bank' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="font-semibold text-primary-900 text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Client Component: Filter + Cards */}
          <AssetBankClient assets={assets}/>

        </div>
      </div>

      <WhatsAppButton/>
    </>
  )
}
