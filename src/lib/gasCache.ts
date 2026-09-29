// Shared in-memory cache untuk semua GAS data
// Di-import oleh sheets.ts, api/sheets/route.ts, dan api/revalidate/route.ts

interface CacheEntry<T> { data: T; expiresAt: number }
const _store = new Map<string, CacheEntry<unknown>>()

// Stale store: tidak pernah expire — dipakai sebagai fallback saat GAS down
const _stale = new Map<string, unknown>()

export function getCached<T>(key: string): T | null {
  const entry = _store.get(key)
  if (!entry || Date.now() > entry.expiresAt) { _store.delete(key); return null }
  return entry.data as T
}

export function setCached<T>(key: string, data: T, ttlSeconds = 300) {
  _store.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 })
  _stale.set(key, data)
}

export function getStaleCached<T>(key: string): T | null {
  const val = _stale.get(key)
  return val !== undefined ? (val as T) : null
}

export function clearCache(prefix?: string) {
  if (!prefix) { _store.clear(); return }
  for (const key of _store.keys()) {
    if (key.startsWith(prefix)) _store.delete(key)
  }
  // Stale store TIDAK di-clear — tetap jadi fallback setelah flush
}
