'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

interface Props {
  measurementId: string
}

/**
 * GoogleAnalytics — Enhanced Measurement untuk Next.js 14 App Router.
 *
 * Masalah: Next.js pakai client-side routing (tidak ada full page reload),
 * sehingga GA4 Enhanced Measurement (page_view, scroll, outbound click, dll)
 * tidak terpicu otomatis saat navigasi antar halaman.
 *
 * Solusi: komponen ini listen setiap perubahan pathname/searchParams
 * lalu manual fire `page_view` event ke GA4 agar Enhanced Measurement
 * bekerja sempurna di setiap halaman.
 */
export default function GoogleAnalytics({ measurementId }: Props) {
  const pathname    = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!measurementId || !window.gtag) return

    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')

    // Fire page_view — ini yang mengaktifkan semua Enhanced Measurement:
    // scroll depth, outbound clicks, site search, video, file download, form
    window.gtag('event', 'page_view', {
      page_path:     url,
      page_location: window.location.href,
      page_title:    document.title,
    })
  }, [pathname, searchParams, measurementId])

  return null
}
