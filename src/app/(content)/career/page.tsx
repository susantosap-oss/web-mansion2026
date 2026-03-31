import { Metadata } from 'next'
import ContentPage, { getContentConfig } from '../ContentPage'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Karir' }

export default async function CareerPage() {
  const content = await getContentConfig('karir')
  return (
    <ContentPage
      title="Karir"
      icon="💼"
      content={content}
      fallback={`Bergabunglah bersama tim MANSION Realty dan bangun karir properti Anda bersama kami.\n\n# Posisi Tersedia\n- Agen Properti\n- Koordinator Tim\n- Business Manager\n\n# Keuntungan Bergabung\n- Komisi kompetitif\n- Pelatihan & sertifikasi profesional\n- Sistem CRM canggih\n- Support marketing digital\n\nHubungi kami melalui WhatsApp untuk informasi lebih lanjut.`}
    />
  )
}
