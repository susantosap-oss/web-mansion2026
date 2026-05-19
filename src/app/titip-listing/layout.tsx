import type { Metadata } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mansionpro.id'

export const metadata: Metadata = {
  title: 'Titip Jual Properti - Mansion Properti',
  description:
    'Mau jual atau sewakan rumah, ruko, gudang, atau tanah Anda lebih cepat? Titip listing properti Anda di Mansion Properti. Proses mudah, gratis biaya promosi, dan ditangani agen profesional.',
  alternates: { canonical: `${BASE}/titip-listing` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Titip Jual Properti - Mansion Properti',
    description:
      'Titip listing properti Anda di Mansion Properti. Gratis, cepat terjual, ditangani agen profesional bersertifikat BNSP.',
    url:  `${BASE}/titip-listing`,
    type: 'website',
  },
}

export default function TitipListingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
