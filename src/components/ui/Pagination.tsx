'use client'

export default function Pagination({ page, totalPages, onPageChange }: {
  page: number
  totalPages: number
  onPageChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  const goTo = (p: number) => {
    onPageChange(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7)          return i + 1
    if (page <= 4)                return i + 1
    if (page >= totalPages - 3)   return totalPages - 6 + i
    return page - 3 + i
  })

  return (
    <div className="flex justify-center items-center gap-2 mt-10">
      <button
        onClick={() => goTo(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        ← Prev
      </button>
      {pages.map(p => (
        <button key={p} onClick={() => goTo(p)}
          className={`w-9 h-9 text-sm font-semibold rounded-lg transition-colors ${
            page === p ? 'bg-primary-900 text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
          }`}>
          {p}
        </button>
      ))}
      <button
        onClick={() => goTo(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        Next →
      </button>
    </div>
  )
}
