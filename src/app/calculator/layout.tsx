import type { Metadata } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mansionpro.id'

export const metadata: Metadata = {
  title: 'Kalkulator KPR & Simulasi Cicilan Properti - Mansion Realty',
  description:
    'Simulasi KPR online: hitung cicilan konvensional, syariah, KMG, dan take-over. Lengkap dengan rincian biaya provisi, notaris, BPHTB, dan asuransi.',
  alternates: { canonical: `${BASE}/calculator` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Kalkulator KPR & Simulasi Cicilan Properti - Mansion Realty',
    description:
      'Hitung simulasi KPR real-time: 4 skema pembiayaan, rincian biaya lengkap, dan tabel amortisasi. Gratis, tanpa registrasi.',
    url: `${BASE}/calculator`,
    type: 'website',
  },
}

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
