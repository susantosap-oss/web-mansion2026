import type { Metadata } from 'next'
import Link from 'next/link'
import { getProjects, getListings, getNews } from '@/lib/sheets'
import { ProjectCard, ListingCard } from '@/components/property/PropertyCard'

const shuffleDaily = (arr: any[]) => { 
  const seed = new Date().getFullYear() * 1000 + (new Date().getMonth() + 1) * 100 + new Date().getDate(); 
  let m = arr.length, t, i; 
  while (m) { 
    i = Math.floor(Math.abs(Math.sin(seed + m)) * m--); 
    t = arr[m]; arr[m] = arr[i]; arr[i] = t; 
  } 
  return arr; 
};
export const revalidate = 300
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: 'Mansion Realty | Properti Impian Anda, Investasi Terbaik Anda',
  description: 'Temukan proyek perumahan, rumah dijual, dan properti premium bersama agen terpercaya Mansion Realty.',
}

export default async function HomePage() {
  const [projects, saleListings, rentListings, news] = await Promise.all([
    getProjects(), getListings({ type: "Sale" }), getListings({ type: "Rent" }), getNews(3),
  ]);
  const allListings = shuffleDaily([...saleListings, ...rentListings]).slice(0, 3);
  const wa = process.env.NEXT_PUBLIC_WA_OFFICE || "6281234567890"
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center bg-navy-texture overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800" />
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-5" style={{backgroundImage:'repeating-linear-gradient(45deg,#c9a84c 0,#c9a84c 1px,transparent 0,transparent 50%)',backgroundSize:'20px 20px'}}/>
        <div className="section-wrapper relative z-10 py-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="divider-gold" />
              <span className="text-gold font-semibold text-sm uppercase tracking-widest">Agen Properti Terpercaya</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-tight mb-6">
              Properti Impian <span className="text-gradient-gold">Anda</span>,<br/>Investasi Terbaik
            </h1>
            <p className="text-xl text-white/70 mb-10 max-w-xl leading-relaxed">
              Temukan rumah, apartemen, kavling, dan properti komersial premium dengan bantuan agen berpengalaman Mansion Realty.
            </p>
            <div className="flex flex-wrap gap-4 mb-14">
              <Link href="/listings" className="btn-gold px-8 py-4 text-base">🏠 Cari Properti</Link>
              <a href={`https://wa.me/${wa}?text=Halo%20Mansion%20Realty%2C%20saya%20ingin%20konsultasi`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-primary-900 transition-all text-base">
                💬 Konsultasi Gratis
              </a>
            </div>
            <div className="flex flex-wrap gap-8">
              {[{n:`${projects.length}+`,l:'Proyek Aktif'},{n:`${saleListings.length}+`,l:'Dijual'}, {n:`${rentListings.length}+`,l:'Disewa'},{n:'50+',l:'Agen'},{n:'1.000+',l:'Transaksi Sukses'}].map(s => (
                <div key={s.l}><div className="text-3xl font-display font-bold text-gold">{s.n}</div><div className="text-sm text-white/60 mt-0.5">{s.l}</div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Proyek Baru */}
      <section className="py-20 bg-white">
        <div className="section-wrapper">
          <div className="flex items-end justify-between mb-10">
            <div><div className="divider-gold mb-3"/><h2 className="section-title">Proyek Baru</h2><p className="section-subtitle">Perumahan baru dari developer terpercaya</p></div>
            <Link href="/projects" className="hidden md:inline-flex btn-outline text-sm">Lihat Semua →</Link>
          </div>
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(0,6).map(p => <ProjectCard key={p.id} project={p}/>)}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-4">🏗</div><p>Data proyek dari CRM Mansion akan tampil di sini.</p></div>
          )}
        </div>
      </section>

      {/* Listing Properti [Jual/Sewa] */}
      <section className="py-20 bg-gray-50">
        <div className="section-wrapper">
          <div className="flex items-end justify-between mb-10">
            <div><div className="divider-gold mb-3"/><h2 className="section-title">Listing Properti [Jual/Sewa]</h2><p className="section-subtitle">Pilihan properti terbaik siap dihuni dan diinvestasikan</p></div>
            <Link href="/listings" className="hidden md:inline-flex btn-outline text-sm">Lihat Semua →</Link>
          </div>
          {allListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allListings.map(l => <ListingCard key={l.id} listing={l}/>)}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-4">🏠</div><p>Data listing dari CRM Mansion akan tampil di sini.</p></div>
          )}
        </div>
      </section>

      {/* Titip Listing CTA */}
      <section className="py-20 bg-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'repeating-linear-gradient(45deg,#c9a84c 0,#c9a84c 1px,transparent 0,transparent 50%)',backgroundSize:'24px 24px'}}/>
        <div className="section-wrapper relative z-10 text-center">
          <div className="divider-gold mx-auto mb-4"/>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Punya Properti untuk Dijual atau Disewakan?</h2>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">Titipkan listing properti Anda kepada agen profesional Mansion Realty. Gratis, mudah, dan cepat terjual.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/listings/titip" className="btn-gold px-8 py-4">📋 Titip Listing Sekarang</Link>
            <a href={`https://wa.me/${wa}?text=Halo%20Mansion%20Realty%2C%20saya%20ingin%20titip%20listing`} target="_blank" rel="noopener noreferrer" className="btn-wa px-8 py-4">💬 Chat via WhatsApp</a>
          </div>
        </div>
      </section>

      {/* KPR CTA */}
      <section className="py-20 bg-cream">
        <div className="section-wrapper">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="divider-gold mb-4"/>
              <h2 className="section-title mb-4">Rencanakan Pembiayaan Properti Anda</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">Gunakan kalkulator KPR kami untuk menghitung cicilan konvensional, syariah, KMG, dan take over secara akurat.</p>
              <Link href="/calculator" className="btn-primary">🧮 Hitung Simulasi KPR</Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[['🏦','KPR Konvensional','Angsuran anuitas bank umum'],['☪️','KPR Syariah','Akad murabahah bebas riba'],['💰','KMG','Kredit multiguna properti'],['🔄','Take Over','Alihkan KPR lebih ringan']].map(([icon,label,desc]) => (
                <Link key={label as string} href="/calculator" className="p-4 bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1">
                  <div className="text-2xl mb-2">{icon}</div>
                  <div className="font-display font-semibold text-primary-900 text-sm">{label}</div>
                  <div className="text-xs text-gray-500 mt-1">{desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Berita */}
      {news.length > 0 && (
        <section className="py-20 bg-white">
          <div className="section-wrapper">
            <div className="flex items-end justify-between mb-10">
              <div><div className="divider-gold mb-3"/><h2 className="section-title">Berita & Artikel Properti</h2></div>
              <Link href="/news" className="hidden md:inline-flex btn-outline text-sm">Lihat Semua →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {news.map(a => (
                <Link key={a.id} href={`/news/${a.slug}`} className="card hover:shadow-card-hover transition-all duration-300">
                  <div className="relative h-48 overflow-hidden">
                    {a.coverImage ? <img src={a.coverImage} alt={a.title} className="object-cover w-full h-full property-image"/> : <div className="w-full h-full bg-primary-100 flex items-center justify-center text-4xl">📰</div>}
                    <span className="absolute top-3 left-3 badge bg-primary-900 text-white">{a.category}</span>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-400 mb-2">{new Date(a.publishedAt).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</p>
                    <h3 className="font-display font-semibold text-primary-900 line-clamp-2">{a.title}</h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{a.summary}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
