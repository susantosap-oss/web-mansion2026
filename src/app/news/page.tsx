import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getNews } from '@/lib/sheets'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Berita Properti | Mansion Realty' }

function formatDate(ts: string): string {
  if (!ts) return ''
  try {
    return new Date(ts).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })
  } catch { return ts }
}

export default async function NewsPage() {
  const news = await getNews()

  const categories = ['Semua', ...Array.from(new Set(news.map(n => n.category).filter(Boolean)))]

  return (
    <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
      <div className="section-wrapper">

        {/* Header */}
        <div className="mb-10">
          <div className="divider-gold mb-3"/>
          <h1 className="section-title">Berita & Artikel Properti</h1>
          <p className="text-gray-400 mt-1">{news.length} artikel tersedia</p>
        </div>

        {news.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">📰</div>
            <p className="text-lg font-semibold text-primary-900 mb-2">Belum ada berita</p>
            <p className="text-sm">Konten berita akan tampil di sini setelah ditambahkan via CRM</p>
          </div>
        ) : (
          <>
            {/* Featured — artikel pertama */}
            {news[0] && (
              <Link href={`/news/${news[0].slug}`}
                className="block mb-10 group">
                <div className="grid md:grid-cols-2 gap-0 bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
                  <div className="relative h-64 md:h-auto bg-primary-100">
                    {news[0].coverImage ? (
                      <Image src={news[0].coverImage} alt={news[0].title} fill className="object-cover group-hover:scale-105 transition-transform duration-500"/>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">📰</div>
                    )}
                    <span className="absolute top-4 left-4 badge bg-primary-900 text-white">
                      {news[0].category}
                    </span>
                  </div>
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <span className="text-xs text-gray-400 mb-3">{formatDate(news[0].publishedAt)}</span>
                    <h2 className="text-xl md:text-2xl font-bold text-primary-900 mb-3 group-hover:text-gold transition-colors leading-tight">
                      {news[0].title}
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">
                      {news[0].summary || news[0].content?.slice(0,150)}
                    </p>
                    <span className="text-primary-900 font-semibold text-sm group-hover:text-gold transition-colors">
                      Baca Selengkapnya →
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid artikel lainnya */}
            {news.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.slice(1).map(item => (
                  <Link key={item.slug} href={`/news/${item.slug}`}
                    className="card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group">
                    <div className="relative h-48 overflow-hidden bg-primary-50">
                      {item.coverImage ? (
                        <Image src={item.coverImage} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500"/>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">📰</div>
                      )}
                      <span className="absolute top-3 left-3 badge bg-primary-900/80 text-white text-xs">
                        {item.category}
                      </span>
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-gray-400 mb-2">{formatDate(item.publishedAt)}</p>
                      <h3 className="font-bold text-primary-900 mb-2 line-clamp-2 leading-tight group-hover:text-gold transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                        {item.summary || item.content?.slice(0,100)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
