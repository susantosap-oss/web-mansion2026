'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

/**
 * GoogleAnalytics — SPA page_view tracking untuk Next.js 14 App Router.
 * Hanya pakai usePathname (bukan useSearchParams) agar tidak
 * menyebabkan Suspense defer & tidak merusak performa.
 */
export default function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const pathname = usePathname()

  useEffect(() => {
    if (!measurementId || !window.gtag) return
    window.gtag('event', 'page_view', {
      page_path:     pathname,
      page_location: window.location.href,
      page_title:    document.title,
    })
  }, [pathname, measurementId])

  return null
}
