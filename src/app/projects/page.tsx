import type { Metadata } from 'next'
import Link from 'next/link'
import { getProjects } from '@/lib/sheets'
import { ProjectCard } from '@/components/property/PropertyCard'

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mansionpro.id'

export async function generateMetadata(): Promise<Metadata> {
  const projects = await getProjects()
  const count    = projects.length
  const title    = `${count} Proyek Perumahan Baru Surabaya 2026 | Mansion Realty`
  const description = `Temukan ${count} proyek perumahan baru di Surabaya & sekitarnya. Cluster, kavling, dan rumah siap huni dari developer terpercaya. Harga transparan, cicilan KPR ringan, konsultasi agen gratis.`
  return {
    title,
    description,
    alternates: { canonical: `${BASE}/projects` },
    openGraph: {
      title,
      description,
      url:  `${BASE}/projects`,
      type: 'website',
    },
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type':    'ItemList',
    name:        'Proyek Perumahan Baru Surabaya',
    description: `${projects.length} proyek perumahan aktif`,
    url:         `${BASE}/projects`,
    numberOfItems: projects.length,
    itemListElement: projects.map((p, i) => ({
      '@type':    'ListItem',
      position:   i + 1,
      item: {
        '@type':      'RealEstateListing',
        name:         p.name,
        url:          `${BASE}/projects/${p.slug}`,
        description:  p.description,
        image:        p.coverImage || undefined,
        offers: {
          '@type':         'Offer',
          priceCurrency:   'IDR',
          price:           p.priceMin,
          availability:    'https://schema.org/InStock',
        },
        address: {
          '@type':          'PostalAddress',
          addressLocality:  p.city || 'Surabaya',
          addressRegion:    'Jawa Timur',
          addressCountry:   'ID',
        },
      },
    })),
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Beranda',      item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Proyek Baru',  item: `${BASE}/projects` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}/>

      <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
        <div className="section-wrapper">
          <div className="mb-10">
            <div className="divider-gold mb-3"/>
            <h1 className="section-title">Proyek Perumahan Baru Surabaya</h1>
            <p className="text-gray-400 mt-2">{projects.length} proyek aktif dari developer terpercaya</p>
          </div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p, i) => <ProjectCard key={p.id} project={p} priority={i === 0}/>)}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <div className="text-6xl mb-4">🏗</div>
              <p>Data proyek dari CRM Mansion akan tampil di sini.</p>
            </div>
          )}

          {/* Daftar Harga Banner */}
          <div className="mt-12 flex justify-center">
            <Link href="/daftar-harga"
              className="inline-flex items-center gap-3 bg-primary-900 text-white px-8 py-4 rounded-2xl font-semibold text-sm hover:bg-primary-800 transition-colors shadow-lg">
              <span className="text-gold text-lg">📋</span>
              DAFTAR HARGA PROPERTI MANSION
              <span className="text-gold">→</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
