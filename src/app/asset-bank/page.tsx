import type { Metadata } from 'next'
import { getAssets } from '@/lib/sheets'
import AssetBankClient from './AssetBankClient'
import WhatsAppButton from '@/components/ui/WhatsAppButton'

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mansionpro.id'

export const metadata: Metadata = {
  title: 'Aset Bank — Lelang & Cessie/AYDA | Mansion Realty',
  description: 'Daftar asset bank lelang dan Cessie/AYDA di Surabaya, Gresik, Sidoarjo, dan sekitarnya. Properti hasil lelang bank dan AYDA dari berbagai bank. Hubungi admin Mansion Realty untuk info lengkap.',
  alternates: { canonical: `${BASE}/asset-bank` },
  openGraph: {
    title: 'Aset Bank — Lelang & Cessie/AYDA | Mansion Realty',
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
            <h1 className="section-title">Aset Bank</h1>
            <p className="text-gray-500 mt-2 max-w-2xl">
              Properti hasil Lelang Bank, Cessie, dan AYDA dari berbagai bank.
            </p>
          </div>

          {/* Client Component: Filter + Cards */}
          <AssetBankClient assets={assets}/>

        </div>
      </div>

      <WhatsAppButton/>
    </>
  )
}
