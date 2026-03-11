'use client'
import { useRouter } from 'next/navigation'

export default function BackButton({ label = 'Kembali' }: { label?: string }) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary-900 transition-colors group mb-4"
    >
      <span className="w-8 h-8 rounded-full border-2 border-gray-200 group-hover:border-primary-900 flex items-center justify-center transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
      </span>
      {label}
    </button>
  )
}
