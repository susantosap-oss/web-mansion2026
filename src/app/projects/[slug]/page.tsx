import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ImageGallery from '@/components/property/ImageGallery'
import { getProjects, getAgents, formatPrice, computeAgentScore } from '@/lib/sheets'
import { getScoreWeights } from '@/lib/serverSheets'
import BackButton from '@/components/ui/BackButton'
import ProjectDetailClient from './ProjectDetailClient'

export const dynamic = 'force-dynamic'
interface Props { params: { slug: string } }

export default async function ProjectDetailPage({ params }: Props) {
  const slug     = decodeURIComponent(params.slug)
  const [projects, allAgents, weights] = await Promise.all([getProjects(), getAgents(), getScoreWeights()])
  const project  = projects.find(p => p.slug === slug || p.id === slug)
  if (!project) notFound()

  // Koordinator proyek selalu di posisi #1 — mandatory, lepas dari score & status verified
  const koordAgent = project.agentId
    ? allAgents.find(a => a.id === project.agentId) ?? null
    : null

  // Sisa slot: agen verified lain, sorted by score
  const restAgents = allAgents
    .filter(a => a.verified && a.id !== project.agentId)
    .sort((a, b) => computeAgentScore(b, weights) - computeAgentScore(a, weights))
    .slice(0, koordAgent ? 9 : 10)

  const agents = koordAgent ? [koordAgent, ...restAgents] : restAgents

  const waKantor = `https://wa.me/${process.env.NEXT_PUBLIC_WA_OFFICE || '6281234567890'}`

  return (
    <div className="pt-24 pb-16 bg-white min-h-screen">
      <div className="section-wrapper">
        <BackButton label="Kembali ke Proyek" />

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-primary-900">Beranda</Link>
          <span>/</span>
          <Link href="/projects" className="hover:text-primary-900">Proyek Baru</Link>
          <span>/</span>
          <span className="text-primary-900 font-medium">{project.name}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Kiri */}
          <div className="lg:col-span-2">
            {/* Gallery — semua foto bisa diklik/diperbesar */}
            <div className="relative mb-2">
              <div className="absolute top-4 left-4 flex gap-2 z-10">
                <span className="badge bg-primary-900 text-white">{project.type}</span>
                <span className={`badge ${
                  project.status === 'Aktif'
                    ? 'bg-green-500 text-white'
                    : project.status === 'Sold Out' ? 'bg-red-500 text-white'
                    : 'badge-new'}`}>
                  {project.status}
                </span>
              </div>
              <ImageGallery images={project.images.length ? project.images : (project.coverImage ? [project.coverImage] : [])} title={project.name} />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-primary-900 mb-2">{project.name}</h1>
            {project.location && (
              <p className="text-gray-400 flex items-center gap-1 mb-2">
                📍 {[project.location, project.city, project.province].filter(Boolean).join(', ')}
              </p>
            )}
            {project.developer && (
              <div className="mb-6">
                <p className="text-sm text-gray-500">Developer</p>
                <p className="font-bold text-primary-900">{project.developer}</p>
              </div>
            )}

            {/* Harga */}
            <div className="bg-primary-50 rounded-2xl p-5 mb-6">
              <p className="text-xs text-gray-400 mb-1">Harga Mulai</p>
              <p className="text-3xl font-bold text-primary-900">{formatPrice(project.priceMin)}</p>
              {project.priceMax > project.priceMin && (
                <p className="text-gray-400 text-sm mt-1">s/d {formatPrice(project.priceMax)}</p>
              )}
            </div>

            {/* Deskripsi */}
            {project.description && (
              <div>
                <h2 className="font-bold text-primary-900 mb-3 text-lg">Deskripsi</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">{project.description}</p>
              </div>
            )}
          </div>

          {/* Kanan: Sidebar dengan agent picker + lead capture */}
          <div>
            <ProjectDetailClient project={project} agents={agents} waKantor={waKantor} />
          </div>
        </div>
      </div>
    </div>
  )
}
