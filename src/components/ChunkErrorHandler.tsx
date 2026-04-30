'use client'
import { useEffect } from 'react'

export default function ChunkErrorHandler() {
  useEffect(() => {
    const RELOAD_KEY = '__chunk_reloaded__'

    const tryReload = () => {
      if (!sessionStorage.getItem(RELOAD_KEY)) {
        sessionStorage.setItem(RELOAD_KEY, '1')
        window.location.reload()
      }
    }

    const onError = (e: ErrorEvent) => {
      const msg = e.message || ''
      if (msg.includes('ChunkLoadError') || msg.includes('Loading chunk')) {
        e.preventDefault()
        tryReload()
      }
    }

    const onUnhandledRejection = (e: PromiseRejectionEvent) => {
      const name = e.reason?.name || ''
      const msg  = e.reason?.message || ''
      if (name === 'ChunkLoadError' || msg.includes('Loading chunk')) {
        e.preventDefault()
        tryReload()
      }
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onUnhandledRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onUnhandledRejection)
    }
  }, [])

  return null
}
