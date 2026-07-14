import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { findCleanURL } from '@/lib/cleanUrls'
import CalculatorPage from '../page'

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mansionpro.id'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cleanURL = await findCleanURL(params.slug)
  if (!cleanURL || cleanURL.pathPrefix !== 'calculator') {
    return { title: 'Simulasi KPR — Mansion Realty', robots: { index: false, follow: false } }
  }
  return {
    title: cleanURL.title,
    description: cleanURL.description,
    alternates: { canonical: `${BASE}/calculator/${params.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: cleanURL.title,
      description: cleanURL.description,
      url: `${BASE}/calculator/${params.slug}`,
      type: 'website',
    },
  }
}

export default async function CalculatorSlugPage({ params }: Props) {
  const cleanURL = await findCleanURL(params.slug)
  if (!cleanURL || cleanURL.pathPrefix !== 'calculator') notFound()
  return <CalculatorPage customH1={cleanURL.h1} />
}
