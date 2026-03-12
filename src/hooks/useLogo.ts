'use client'
import { useState, useEffect } from 'react'

let cachedLogo: string | null = null

export function useLogo() {
  const [logoUrl, setLogoUrl] = useState<string>(cachedLogo || '')

  useEffect(() => {
    if (cachedLogo) { setLogoUrl(cachedLogo); return }
    fetch('/api/config?key=logo_url')
      .then(r => r.json())
      .then(d => {
        if (d.value && String(d.value).startsWith('http')) {
          cachedLogo = d.value
          setLogoUrl(d.value)
        }
      })
      .catch(() => {})
  }, [])

  return logoUrl
}
