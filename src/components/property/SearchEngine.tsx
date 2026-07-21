'use client'

/**
 * SearchEngine Component
 * ============================================
 * Client-side property search UI.
 * Memanggil /api/search (Next.js proxy → CRM Search Engine).
 * URL-based state: semua filter tersimpan di URL query params.
 */

import { useState, useEffect, useCallback, useRef, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ListingCard } from '@/components/property/PropertyCard'
import {
  searchListings, aiSearchListings, mapCrmToListing, formatPriceShort,
  type SearchOptions, type SearchParams, type SearchResult, type AiSearchResponse,
} from '@/lib/searchApi'
import type { Listing } from '@/types'

// ── Price Quick Select ─────────────────────────────────────
const PRICE_CHIPS = [
  { label: '≤ 500 Jt',   min: 0,           max: 500_000_000   },
  { label: '500 Jt–1 M', min: 500_000_000,  max: 1_000_000_000 },
  { label: '1 M–3 M',    min: 1_000_000_000, max: 3_000_000_000 },
  { label: '≥ 3 M',      min: 3_000_000_000, max: 0             },
]

const SORT_OPTIONS = [
  { value: 'terbaru',      label: 'Terbaru' },
  { value: 'terlama',      label: 'Terlama' },
  { value: 'harga_termurah', label: 'Harga ↑' },
  { value: 'harga_termahal', label: 'Harga ↓' },
  { value: 'terpopuler',   label: 'Terpopuler' },
]

// ── Props ──────────────────────────────────────────────────
interface Props {
  initialOptions: SearchOptions
}

// ── Main Component ─────────────────────────────────────────
export default function SearchEngine({ initialOptions }: Props) {
  const router      = useRouter()
  const pathname    = usePathname()
  const urlParams   = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Filter state — synced FROM URL on mount / URL change
  const [keyword,      setKeyword]      = useState(urlParams.get('keyword')          || '')
  const [propType,     setPropType]     = useState(urlParams.get('property_type')    || '')
  const [txType,       setTxType]       = useState(urlParams.get('transaction_type') || '')
  const [city,         setCity]         = useState(urlParams.get('city')             || '')
  const [area,         setArea]         = useState(urlParams.get('area')             || '')
  const [priceMin,     setPriceMin]     = useState(urlParams.get('price_min')        || '')
  const [priceMax,     setPriceMax]     = useState(urlParams.get('price_max')        || '')
  const [bedroomMin,   setBedroomMin]   = useState(Number(urlParams.get('bedroom_min')  || 0))
  const [bathroomMin,  setBathroomMin]  = useState(Number(urlParams.get('bathroom_min') || 0))
  const [ltMin,        setLtMin]        = useState(urlParams.get('land_area_min')    || '')
  const [ltMax,        setLtMax]        = useState(urlParams.get('land_area_max')    || '')
  const [lbMin,        setLbMin]        = useState(urlParams.get('building_area_min') || '')
  const [lbMax,        setLbMax]        = useState(urlParams.get('building_area_max') || '')
  const [sort,         setSort]         = useState(urlParams.get('sort')             || 'terbaru')
  const [page,         setPage]         = useState(Number(urlParams.get('page')      || 1))
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Result state
  const [result,    setResult]    = useState<SearchResult | null>(null)
  const [listings,  setListings]  = useState<Listing[]>([])
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  // AI Search mode
  const [aiMode,    setAiMode]    = useState(false)
  const [aiQuery,   setAiQuery]   = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError,   setAiError]   = useState<string | null>(null)
  const [aiResult,  setAiResult]  = useState<AiSearchResponse['ai'] | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Build params from state ──────────────────────────────
  const buildParams = useCallback((): SearchParams => ({
    keyword:           keyword.trim()    || undefined,
    property_type:     propType          || undefined,
    transaction_type:  txType            || undefined,
    city:              city              || undefined,
    area:              area              || undefined,
    price_min:         priceMin          || undefined,
    price_max:         priceMax          || undefined,
    bedroom_min:       bedroomMin  > 0 ? bedroomMin  : undefined,
    bathroom_min:      bathroomMin > 0 ? bathroomMin : undefined,
    land_area_min:     ltMin            || undefined,
    land_area_max:     ltMax            || undefined,
    building_area_min: lbMin            || undefined,
    building_area_max: lbMax            || undefined,
    sort:              sort as SearchParams['sort'],
    page,
    limit: 12,
  }), [keyword, propType, txType, city, area, priceMin, priceMax,
       bedroomMin, bathroomMin, ltMin, ltMax, lbMin, lbMax, sort, page])

  // ── Push state to URL ────────────────────────────────────
  const syncUrl = useCallback((params: SearchParams) => {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== 0) qs.set(k, String(v))
    })
    // Remove page=1 from URL (default)
    if (qs.get('page') === '1') qs.delete('page')
    startTransition(() => {
      router.replace(`${pathname}?${qs.toString()}`, { scroll: false })
    })
  }, [router, pathname])

  // ── Execute search ───────────────────────────────────────
  const runSearch = useCallback(async (params: SearchParams) => {
    setLoading(true)
    setError(null)
    try {
      const res = await searchListings(params)
      setResult(res)
      setListings((res.results || []).map(mapCrmToListing))
    } catch (e: any) {
      setError(e.message || 'Terjadi kesalahan saat mencari')
      setResult(null)
      setListings([])
    } finally {
      setLoading(false)
    }
  }, [])

  // ── On mount: run initial search ─────────────────────────
  useEffect(() => {
    const params = buildParams()
    runSearch(params)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Trigger search when filters change (debounced for keyword) ──
  const triggerSearch = useCallback((immediate = true) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const run = () => {
      const params = buildParams()
      syncUrl(params)
      runSearch(params)
    }
    if (immediate) run()
    else debounceRef.current = setTimeout(run, 450)
  }, [buildParams, syncUrl, runSearch])

  // Re-trigger when non-keyword filters change
  useEffect(() => {
    triggerSearch(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propType, txType, city, area, priceMin, priceMax, bedroomMin, bathroomMin,
      ltMin, ltMax, lbMin, lbMax, sort, page])

  const handleKeywordChange = (v: string) => {
    setKeyword(v)
    setPage(1)
    triggerSearch(false)
  }

  const handleReset = () => {
    setKeyword(''); setPropType(''); setTxType(''); setCity(''); setArea('')
    setPriceMin(''); setPriceMax(''); setBedroomMin(0); setBathroomMin(0)
    setLtMin(''); setLtMax(''); setLbMin(''); setLbMax('')
    setSort('terbaru'); setPage(1)
  }

  const hasFilters = !!(keyword || propType || txType || city || area ||
    priceMin || priceMax || bedroomMin || bathroomMin || ltMin || ltMax || lbMin || lbMax)

  // ── AI Search handler ────────────────────────────────────
  const runAiSearch = async () => {
    if (!aiQuery.trim()) return
    setAiLoading(true)
    setAiError(null)
    setAiResult(null)
    setError(null)
    try {
      const res = await aiSearchListings(aiQuery.trim(), { page, limit: 12, sort })
      setResult(res)
      setListings((res.results || []).map(mapCrmToListing))
      setAiResult(res.ai)
    } catch (e: any) {
      setAiError(e.message || 'AI Search gagal')
      setResult(null)
      setListings([])
    } finally {
      setAiLoading(false)
    }
  }

  const handleAiModeToggle = () => {
    setAiMode(v => !v)
    setAiResult(null)
    setAiError(null)
  }

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto">

      {/* ── AI / Normal mode toggle ── */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={handleAiModeToggle}
          className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${aiMode ? 'bg-gold text-primary-900 border-gold shadow-gold' : 'bg-white text-gray-500 border-gray-200 hover:border-gold hover:text-gold'}`}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
          </svg>
          {aiMode ? 'Mode AI Aktif' : 'Cari dengan AI'}
        </button>
        {aiMode && (
          <span className="text-xs text-gray-400">Deskripsikan properti yang Anda inginkan dengan bahasa natural</span>
        )}
      </div>

      {/* ── AI Search Bar ── */}
      {aiMode ? (
        <div className="mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
              </svg>
              <input
                type="text"
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') runAiSearch() }}
                placeholder='cth: "rumah 3 kamar di Citraland harga di bawah 3 M"'
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gold/40 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
              />
            </div>
            <button
              onClick={runAiSearch}
              disabled={aiLoading || !aiQuery.trim()}
              className="px-6 py-4 rounded-2xl bg-gold text-primary-900 font-semibold text-sm hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 whitespace-nowrap">
              {aiLoading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              )}
              Cari
            </button>
          </div>

          {/* Extracted filter pills (transparency) */}
          {aiResult && !aiResult.fallback && Object.keys(aiResult.extracted_filter).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-gray-400 font-medium">Filter terdeteksi:</span>
              {Object.entries(aiResult.extracted_filter).map(([k, v]) => (
                <span key={k} className="inline-flex items-center gap-1 text-xs bg-gold/10 text-primary-900 border border-gold/40 px-2.5 py-1 rounded-full font-medium">
                  {k.replace(/_/g, ' ')}: {String(v)}
                </span>
              ))}
            </div>
          )}
          {aiResult?.fallback && (
            <p className="mt-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg inline-block">
              AI tidak tersedia — menggunakan pencarian kata kunci biasa
            </p>
          )}
          {aiError && (
            <p className="mt-2 text-xs text-red-600">{aiError}</p>
          )}
        </div>
      ) : (
        /* ── Normal Search Bar ── */
        <div className="relative mb-4">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            value={keyword}
            onChange={e => handleKeywordChange(e.target.value)}
            placeholder="Cari properti, area, tipe... (cth: rumah Citraland 3 kamar)"
            className="w-full pl-12 pr-10 py-4 rounded-2xl border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all"
          />
          {keyword && (
            <button
              onClick={() => { setKeyword(''); setPage(1); triggerSearch(true) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Hapus pencarian">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>
      )}

      {/* ── Quick Filters (hidden in AI mode) ── */}
      {!aiMode && <div className="flex flex-wrap gap-2 mb-3">
        <select value={propType} onChange={e => { setPropType(e.target.value); setPage(1) }}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-200 min-w-[120px]">
          <option value="">Semua Tipe</option>
          {initialOptions.property_types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select value={txType} onChange={e => { setTxType(e.target.value); setPage(1) }}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-200">
          <option value="">Jual & Sewa</option>
          {initialOptions.transaction_types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select value={city} onChange={e => { setCity(e.target.value); setArea(''); setPage(1) }}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-200 min-w-[120px]">
          <option value="">Semua Kota</option>
          {initialOptions.cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <button
          onClick={() => setShowAdvanced(v => !v)}
          className={`inline-flex items-center gap-2 text-sm px-4 py-2 rounded-xl border transition-all ${showAdvanced ? 'bg-primary-900 text-white border-primary-900' : 'border-gray-200 bg-white text-gray-600 hover:border-primary-300'}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
          </svg>
          Filter Lanjut
          {hasFilters && <span className="w-2 h-2 rounded-full bg-gold"></span>}
        </button>

        {hasFilters && (
          <button onClick={handleReset}
            className="text-sm px-4 py-2 rounded-xl border border-red-200 text-red-500 bg-white hover:bg-red-50 transition-all">
            Reset
          </button>
        )}
      </div>}

      {/* ── Advanced Filter Panel ── */}
      {!aiMode && showAdvanced && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Area */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Area / Kecamatan</label>
              <select value={area} onChange={e => { setArea(e.target.value); setPage(1) }}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-200">
                <option value="">Semua Area</option>
                {initialOptions.areas.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {/* Bedroom */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Min Kamar Tidur</label>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4].map(n => (
                  <button key={n} onClick={() => { setBedroomMin(n); setPage(1) }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${bedroomMin === n ? 'bg-primary-900 text-white border-primary-900' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}>
                    {n === 0 ? 'Any' : `${n}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Bathroom */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Min Kamar Mandi</label>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map(n => (
                  <button key={n} onClick={() => { setBathroomMin(n); setPage(1) }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${bathroomMin === n ? 'bg-primary-900 text-white border-primary-900' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}>
                    {n === 0 ? 'Any' : `${n}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Rentang Harga</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {PRICE_CHIPS.map(chip => {
                  const active = String(priceMin || 0) === String(chip.min) && String(priceMax || 0) === String(chip.max)
                  return (
                    <button key={chip.label}
                      onClick={() => { setPriceMin(chip.min ? String(chip.min) : ''); setPriceMax(chip.max ? String(chip.max) : ''); setPage(1) }}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${active ? 'bg-gold text-primary-900 border-gold font-semibold' : 'border-gray-200 text-gray-600 hover:border-gold'}`}>
                      {chip.label}
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-3 items-center">
                <input type="number" placeholder="Harga min" value={priceMin}
                  onChange={e => { setPriceMin(e.target.value); setPage(1) }}
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 min-w-0"/>
                <span className="text-gray-400 text-sm">—</span>
                <input type="number" placeholder="Harga max" value={priceMax}
                  onChange={e => { setPriceMax(e.target.value); setPage(1) }}
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 min-w-0"/>
              </div>
            </div>

            {/* Land Area */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Luas Tanah (m²)</label>
              <div className="flex gap-2 items-center">
                <input type="number" placeholder="Min" value={ltMin} onChange={e => { setLtMin(e.target.value); setPage(1) }}
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 min-w-0"/>
                <span className="text-gray-400 text-xs">—</span>
                <input type="number" placeholder="Max" value={ltMax} onChange={e => { setLtMax(e.target.value); setPage(1) }}
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 min-w-0"/>
              </div>
            </div>

            {/* Building Area */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Luas Bangunan (m²)</label>
              <div className="flex gap-2 items-center">
                <input type="number" placeholder="Min" value={lbMin} onChange={e => { setLbMin(e.target.value); setPage(1) }}
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 min-w-0"/>
                <span className="text-gray-400 text-xs">—</span>
                <input type="number" placeholder="Max" value={lbMax} onChange={e => { setLbMax(e.target.value); setPage(1) }}
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 min-w-0"/>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Result Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="text-sm text-gray-500">
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Mencari...
            </span>
          ) : result ? (
            <span>
              <strong className="text-primary-900 font-bold">{result.total.toLocaleString('id-ID')}</strong>{' '}
              listing ditemukan
            </span>
          ) : null}
        </div>

        <select value={sort} onChange={e => { setSort(e.target.value); setPage(1) }}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-200">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="text-center py-12 bg-red-50 rounded-2xl mb-6">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-600 font-semibold">{error}</p>
          <button onClick={() => runSearch(buildParams())} className="mt-4 btn-primary text-sm">
            Coba Lagi
          </button>
        </div>
      )}

      {/* ── Results Grid ── */}
      {!loading && !error && listings.length === 0 && result && (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="font-display font-bold text-primary-900 text-xl mb-2">Tidak ada hasil ditemukan</h3>
          <p className="text-gray-500 text-sm mb-6">Coba ubah filter atau kata kunci pencarian Anda</p>
          <button onClick={handleReset} className="btn-primary">Hapus Semua Filter</button>
        </div>
      )}

      {listings.length > 0 && (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {listings.map((listing, i) => (
            <ListingCard key={listing.id} listing={listing} priority={i < 3} />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {result && result.total_pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10">
          <button
            disabled={page <= 1 || loading}
            onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            ← Prev
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: Math.min(result.total_pages, 7) }, (_, i) => {
              let p: number
              if (result.total_pages <= 7) {
                p = i + 1
              } else if (page <= 4) {
                p = i + 1
              } else if (page >= result.total_pages - 3) {
                p = result.total_pages - 6 + i
              } else {
                p = page - 3 + i
              }
              return (
                <button key={p}
                  onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${p === page ? 'bg-primary-900 text-white' : 'border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
                  {p}
                </button>
              )
            })}
          </div>

          <button
            disabled={page >= result.total_pages || loading}
            onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            Next →
          </button>
        </div>
      )}

      {result && result.total_pages > 1 && (
        <p className="text-center text-xs text-gray-400 mt-3">
          Halaman {page} dari {result.total_pages} · {result.total.toLocaleString('id-ID')} listing
        </p>
      )}
    </div>
  )
}
