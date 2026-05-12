'use client'
import { useState, useMemo } from 'react'
import { Project } from '@/types'
import { ProjectCard } from '@/components/property/PropertyCard'

export default function ProjectsClient({ projects }: { projects: Project[] }) {
  const [activeCity, setActiveCity] = useState<string>('Semua')

  const cities = useMemo(() => {
    const set = new Set<string>()
    projects.forEach(p => { if (p.city) set.add(p.city) })
    return ['Semua', ...Array.from(set).sort()]
  }, [projects])

  const filtered = useMemo(() =>
    activeCity === 'Semua' ? projects : projects.filter(p => p.city === activeCity),
    [projects, activeCity]
  )

  return (
    <>
      {/* Tab Bar */}
      {cities.length > 2 && (
        <div className="flex flex-wrap gap-3 mb-8">
          {cities.map(city => (
            <button
              key={city}
              onClick={() => setActiveCity(city)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all whitespace-nowrap ${
                activeCity === city
                  ? 'bg-primary-900 text-white border-primary-900'
                  : 'border-gray-200 text-gray-600 hover:border-primary-300 bg-white'
              }`}
            >
              {city}
              {city !== 'Semua' && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  activeCity === city
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {projects.filter(p => p.city === city).length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p, i) => <ProjectCard key={p.id} project={p} priority={i === 0}/>)}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">🏗</div>
          <p>Tidak ada proyek di {activeCity}</p>
        </div>
      )}
    </>
  )
}
