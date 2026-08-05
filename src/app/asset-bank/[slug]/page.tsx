import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAssets } from '@/lib/sheets'
import { findCleanURLByPrefix } from '@/lib/cleanUrls'
import AssetBankClient from '../AssetBankClient'
import WhatsAppButton from '@/components/ui/WhatsAppButton'

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mansionpro.id'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug     = decodeURIComponent(params.slug)
  const cleanURL = await findCleanURLByPrefix('asset-bank', slug)
  if (!cleanURL) return { title: 'Tidak Ditemukan', robots: { index: false, follow: false } }

  return {
    title:       cleanURL.title,
    description: cleanURL.description,
    alternates:  { canonical: `${BASE}/asset-bank/${slug}` },
    openGraph:   { title: cleanURL.title, description: cleanURL.description, url: `${BASE}/asset-bank/${slug}`, type: 'website' },
  }
}

export default async function AssetBankSlugPage({ params }: Props) {
  const slug     = decodeURIComponent(params.slug)
  const cleanURL = await findCleanURLByPrefix('asset-bank', slug)
  if (!cleanURL) notFound()

  const allAssets = await getAssets()
  const assets    = cleanURL.city
    ? allAssets.filter(a => a.kota.toLowerCase() === cleanURL.city!.toLowerCase())
    : allAssets

  return (
    <>
      <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
        <div className="section-wrapper">
          <div className="mb-8">
            <div className="divider-gold mb-3"/>
            <h1 className="section-title">{cleanURL.h1}</h1>
            <p className="text-gray-500 mt-2 max-w-2xl">{cleanURL.description}</p>
          </div>
          <AssetBankClient assets={assets}/>
        </div>
      </div>
      <WhatsAppButton/>
    </>
  )
}
