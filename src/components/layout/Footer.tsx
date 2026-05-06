import LogoBadge from '@/components/ui/LogoBadge'
import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()
  const wa   = process.env.NEXT_PUBLIC_WA_OFFICE || '6281234567890'
  return (
    <footer className="bg-primary-900 text-white">
      <div className="bg-gold py-8">
        <div className="section-wrapper flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-2xl text-primary-900">Siap menemukan properti impian Anda?</h3>
            <p className="text-primary-900 mt-1">Konsultasikan kebutuhan properti Anda dengan agen kami.</p>
          </div>
          <a href={`https://wa.me/${wa}?text=Halo%20MANSION%20Realty%2C%20saya%20ingin%20konsultasi`} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 px-6 py-3 bg-primary-900 text-white font-bold rounded-lg hover:bg-primary-800 transition-colors flex items-center gap-2">
            💬 Konsultasi Gratis via WhatsApp
          </a>
        </div>
      </div>
      <div className="section-wrapper py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <LogoBadge size="md" dark={true} />
              <span className="text-white font-display font-bold text-xl">MANSION <span className="text-gold">Realty</span></span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">Agen properti terpercaya untuk hunian dan investasi terbaik di Indonesia.</p>
            <div className="mt-4 space-y-1 text-sm text-white/60">
              <p>📍 {process.env.NEXT_PUBLIC_COMPANY_ADDRESS || 'Jl. Sentra Niaga Utama Ruko Niaga Utama F-7 Citraland Surabaya'}</p>
              <p>📞 {process.env.NEXT_PUBLIC_COMPANY_PHONE || '+628219880889'}</p>
              <p>✉️ {process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'manprop26@gmail.com'}</p>
            </div>
          </div>
          {[
            { title: 'Properti', links: [['Semua Listing','/listings'],['Proyek Baru','/projects'],['Rumah Dijual','/listings?type=Sale'],['Apartemen','/listings?type=Sale&propertyType=Apartemen'],['Disewa','/listings?type=Rent'],['Kavling','/listings?propertyType=Kavling'],['Gudang','/listings?propertyType=Gudang']] },
            { title: 'Layanan',  links: [['KPR & Pembiayaan','/calculator'],['Titip Listing','/listings/titip'],['Daftar Agen','/agents'],['Berita Properti','/news'],['Tentang Kami','/about']] },
            { title: 'Lainnya', links: [['Karir','/career'],['Kebijakan Privasi','/privacy'],['Syarat & Ketentuan','/terms'],['Hubungi Kami','/contact']] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-white font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(([label, href]) => (
                  <li key={href}><Link href={href} className="text-sm text-white/60 hover:text-gold transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/70">
          <p>© {year} MANSION Realty. Semua hak dilindungi.</p>
          <p>Built with ❤️ for Indonesian Property Market</p>
        </div>
      </div>
    </footer>
  )
}
