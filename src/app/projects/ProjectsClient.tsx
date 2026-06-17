'use client'
import { useState, useMemo } from 'react'
import { Project } from '@/types'
import { ProjectCard } from '@/components/property/PropertyCard'

type PriceRange = 'semua' | 'below' | 'above'

export default function ProjectsClient({ projects }: { projects: Project[] }) {
  const [activeCity, setActiveCity] = useState<string>('Semua')
  const [activePriceRange, setActivePriceRange] = useState<PriceRange>('semua')

  const cities = useMemo(() => {
    const set = new Set<string>()
    projects.forEach(p => { if (p.city) set.add(p.city) })
    return ['Semua', ...Array.from(set).sort()]
  }, [projects])

  const cityFiltered = useMemo(() =>
    activeCity === 'Semua' ? projects : projects.filter(p => p.city === activeCity),
    [projects, activeCity]
  )

  const filtered = useMemo(() => {
    if (activePriceRange === 'below') return cityFiltered.filter(p => p.priceMin < 1_000_000_000)
    if (activePriceRange === 'above') return cityFiltered.filter(p => p.priceMin >= 1_000_000_000)
    return cityFiltered
  }, [cityFiltered, activePriceRange])

  return (
    <>
      {/* City Tabs */}
      {cities.length > 2 && (
        <div className="flex flex-wrap gap-3 mb-4">
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
                  activeCity === city ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {projects.filter(p => p.city === city).length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Price Range Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {([
          ['semua', 'Semua Harga', cityFiltered.length],
          ['below', '< 1 Milyar', cityFiltered.filter(p => p.priceMin < 1_000_000_000).length],
          ['above', '> 1 Milyar', cityFiltered.filter(p => p.priceMin >= 1_000_000_000).length],
        ] as [PriceRange, string, number][]).map(([value, label, count]) => (
          <button
            key={value}
            onClick={() => setActivePriceRange(value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all whitespace-nowrap ${
              activePriceRange === value
                ? 'bg-gold text-primary-900 border-gold'
                : 'border-gray-200 text-gray-600 hover:border-gold bg-white'
            }`}
          >
            {label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              activePriceRange === value ? 'bg-primary-900/20 text-primary-900' : 'bg-gray-100 text-gray-500'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p, i) => <ProjectCard key={p.id} project={p} priority={i === 0}/>)}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">🏗</div>
          <p>Tidak ada proyek {activePriceRange !== 'semua'
            ? `dengan harga ${activePriceRange === 'below' ? '< 1 Milyar' : '> 1 Milyar'}`
            : `di ${activeCity}`}
          </p>
        </div>
      )}
    </>
  )
}
