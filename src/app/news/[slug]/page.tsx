import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getNews } from '@/lib/sheets'
import BackButton from '@/components/ui/BackButton'

export const dynamic = 'force-dynamic'
interface Props { params: { slug: string } }

function formatDate(ts: string): string {
  if (!ts) return ''
  try { return new Date(ts).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }) }
  catch { return ts }
}

export default async function NewsDetailPage({ params }: Props) {
  const slug = decodeURIComponent(params.slug)
  const news = await getNews()
  const item = news.find(n => n.slug === slug)
  if (!item) notFound()

  // Artikel terkait — kategori sama, max 3
  const related = news
    .filter(n => n.slug !== slug && n.category === item.category)
    .slice(0, 3)

  return (
    <div className="pt-24 pb-16 bg-white min-h-screen">
      <div className="section-wrapper">
        <BackButton label="Kembali ke Berita" />

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-primary-900">Beranda</Link>
          <span>/</span>
          <Link href="/news" className="hover:text-primary-900">Berita</Link>
          <span>/</span>
          <span className="text-primary-900 font-medium truncate max-w-xs">{item.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-10">

          {/* Konten Utama */}
          <div className="lg:col-span-2">
            {/* Category + Date */}
            <div className="flex items-center gap-3 mb-4">
              <span className="badge bg-primary-900 text-white">{item.category}</span>
              <span className="text-sm text-gray-400">{formatDate(item.createdAt)}</span>
              <span className="text-sm text-gray-400">· oleh {item.author}</span>
            </div>

            {/* Judul */}
            <h1 className="text-2xl md:text-3xl font-bold text-primary-900 mb-6 leading-tight">
              {item.title}
            </h1>

            {/* Cover Image */}
            {item.coverImage && (
              <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8 bg-gray-100">
                <Image src={item.coverImage} alt={item.title} fill className="object-cover" priority sizes="66vw"/>
              </div>
            )}

            {/* Ringkasan */}
            {item.summary && (
              <div className="bg-primary-50 border-l-4 border-primary-900 rounded-r-xl p-4 mb-6">
                <p className="text-primary-900 font-semibold text-sm leading-relaxed italic">
                  {item.summary}
                </p>
              </div>
            )}

            {/* Konten */}
            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
              {item.content}
            </div>

            {/* Share */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-400 mb-3">Bagikan artikel ini:</p>
              <div className="flex gap-2">
                <a href={`https://wa.me/?text=${encodeURIComponent(item.title + '\n\n' + (process.env.NEXT_PUBLIC_SITE_URL||'') + '/news/' + item.slug)}`}
                   target="_blank" rel="noopener noreferrer"
                   className="px-4 py-2 bg-[#128C7E] text-white rounded-xl text-sm font-semibold hover:bg-[#0e6b5e] transition-colors">
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">

              {/* Artikel Terkait */}
              {related.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-bold text-primary-900 mb-4 text-sm uppercase tracking-wide">
                    Artikel Terkait
                  </h3>
                  <div className="space-y-4">
                    {related.map(r => (
                      <Link key={r.slug} href={`/news/${r.slug}`}
                        className="flex gap-3 group hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {r.coverImage ? (
                            <Image src={r.coverImage} alt={r.title} width={64} height={64} className="object-cover w-full h-full"/>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">📰</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-primary-900 line-clamp-2 group-hover:text-gold transition-colors">
                            {r.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(r.createdAt)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Konsultasi */}
              <div className="card p-5 bg-primary-900 text-white">
                <p className="font-bold mb-1">Butuh konsultasi properti?</p>
                <p className="text-white/60 text-xs mb-4">Tim agen kami siap membantu</p>
                <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_OFFICE||'6281234567890'}?text=${encodeURIComponent('Halo Mansion Realty, saya ingin konsultasi properti.')}`}
                   target="_blank" rel="noopener noreferrer"
                   className="btn-wa w-full justify-center py-2.5 text-sm">
                  💬 Hubungi Agen
                </a>
              </div>

              {/* Semua Berita */}
              <Link href="/news"
                className="block text-center text-sm text-primary-900 font-semibold hover:text-gold transition-colors">
                ← Lihat Semua Berita
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
