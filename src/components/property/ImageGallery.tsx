'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface Props {
  images: string[]
  title: string
}

export default function ImageGallery({ images, title }: Props) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const prev = useCallback(() => setActiveIdx(i => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setActiveIdx(i => (i + 1) % images.length), [images.length])

  // Keyboard navigation saat lightbox terbuka
  useEffect(() => {
    if (!lightbox) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape')     setLightbox(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, prev, next])

  if (!images.length) {
    return (
      <div className="rounded-2xl overflow-hidden mb-6 bg-gray-100">
        <div className="relative h-72 md:h-[460px] flex items-center justify-center text-6xl">🏠</div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-2xl overflow-hidden mb-6 bg-gray-100">
        {/* Main photo */}
        <div
          className="relative h-72 md:h-[460px] cursor-pointer group"
          onClick={() => setLightbox(true)}
        >
          <Image
            src={images[activeIdx]}
            alt={`${title} — foto ${activeIdx + 1}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.01]"
            priority={activeIdx === 0}
            sizes="66vw"
          />
          {/* Overlay hint */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white text-sm px-3 py-1.5 rounded-full">
              🔍 Perbesar
            </span>
          </div>
          {/* Counter badge */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
              {activeIdx + 1} / {images.length}
            </div>
          )}
          {/* Prev / Next arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev() }}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                aria-label="Foto sebelumnya"
              >‹</button>
              <button
                onClick={e => { e.stopPropagation(); next() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                aria-label="Foto berikutnya"
              >›</button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-1 mt-1 overflow-x-auto pb-0.5">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => { setActiveIdx(i); setLightbox(true) }}
                className={`relative flex-shrink-0 h-16 w-24 overflow-hidden transition-all ${
                  i === activeIdx ? 'ring-2 ring-amber-500 opacity-100' : 'opacity-60 hover:opacity-90'
                }`}
              >
                <Image src={img} alt={`thumbnail ${i + 1}`} fill className="object-cover" sizes="96px"/>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col"
          onClick={() => setLightbox(false)}
        >
          {/* Top bar — close button selalu terlihat */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3" onClick={e => e.stopPropagation()}>
            <span className="text-white/60 text-sm">{activeIdx + 1} / {images.length}</span>
            <button
              onClick={() => setLightbox(false)}
              className="bg-white/10 hover:bg-white/25 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors"
              aria-label="Tutup"
            >✕</button>
          </div>

          {/* Image area */}
          <div
            className="flex-1 relative mx-4 mb-4"
            onClick={e => e.stopPropagation()}
          >
            <Image
              src={images[activeIdx]}
              alt={`${title} — foto ${activeIdx + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />

            {/* Arrows */}
            {images.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors">‹</button>
                <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors">›</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
