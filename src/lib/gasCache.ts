// Shared in-memory cache untuk semua GAS data
// Di-import oleh sheets.ts, api/sheets/route.ts, dan api/revalidate/route.ts

interface CacheEntry<T> { data: T; expiresAt: number }
const _store = new Map<string, CacheEntry<unknown>>()

export function getCached<T>(key: string): T | null {
  const entry = _store.get(key)
  if (!entry || Date.now() > entry.expiresAt) { _store.delete(key); return null }
  return entry.data as T
}

export function setCached<T>(key: string, data: T, ttlSeconds = 300) {
  _store.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 })
}

export function clearCache(prefix?: string) {
  if (!prefix) { _store.clear(); return }
  for (const key of _store.keys()) {
    if (key.startsWith(prefix)) _store.delete(key)
  }
}
