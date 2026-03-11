'use client'
import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'mansion_favourites'

export function useFavourite() {
  const [favourites, setFavourites] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setFavourites(JSON.parse(stored))
    } catch {}
  }, [])

  const toggle = useCallback((listingId: string) => {
    setFavourites(prev => {
      const next = prev.includes(listingId)
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const isFavourite = useCallback((listingId: string) => {
    return favourites.includes(listingId)
  }, [favourites])

  const clear = useCallback(() => {
    setFavourites([])
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  return { favourites, toggle, isFavourite, clear, total: favourites.length }
}
