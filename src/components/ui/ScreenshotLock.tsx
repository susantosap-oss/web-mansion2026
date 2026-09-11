'use client'
import { useEffect } from 'react'

export default function ScreenshotLock({ allowed = false }: { allowed?: boolean }) {
  useEffect(() => {
    if (allowed) return

    const style = document.createElement('style')
    style.textContent = `@media print { body { display: none !important; } }`
    document.head.appendChild(style)

    const blur = () => {
      document.body.style.filter = 'blur(20px)'
      setTimeout(() => { document.body.style.filter = '' }, 1500)
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault()
        blur()
        return
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        blur()
      }
    }

    document.addEventListener('keydown', onKey, { capture: true })
    window.addEventListener('keyup', (e) => {
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') blur()
    }, { capture: true })

    return () => {
      document.removeEventListener('keydown', onKey, { capture: true })
      document.head.removeChild(style)
    }
  }, [allowed])

  return null
}
