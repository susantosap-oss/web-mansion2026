'use client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function BackButtonDynamic() {
  const router = useRouter()
  const params = useSearchParams()
  const from   = params.get('from')

  const handleBack = () => {
    if (from) router.push(decodeURIComponent(from))
    else router.back()
  }

  return (
    <button onClick={handleBack}
      className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white transition-colors group">
      <span className="w-8 h-8 rounded-full border-2 border-white/20 group-hover:border-white flex items-center justify-center transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
      </span>
      {from ? 'Kembali ke Detail Properti' : 'Kembali'}
    </button>
  )
}
