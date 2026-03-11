import type { Metadata } from 'next'
import Link from 'next/link'
import BackButton from '@/components/ui/BackButton'
import { getProjects } from '@/lib/sheets'
import { ProjectCard } from '@/components/property/PropertyCard'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Proyek Baru | Mansion Realty' }

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
      <div className="section-wrapper">
        <div className="mb-10">
          <div className="divider-gold mb-3"/>
          <h1 className="section-title">Proyek Baru</h1>
          <p className="text-gray-400 mt-2">{projects.length} proyek aktif</p>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(p => <ProjectCard key={p.id} project={p}/>)}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">🏗</div>
            <p>Data proyek dari CRM Mansion akan tampil di sini.</p>
          </div>
        )}
      </div>
    </div>
  )
}
