import { Metadata } from 'next'
import ContentPage, { getContentConfig } from '../ContentPage'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Tentang Kami' }

export default async function AboutPage() {
  const content = await getContentConfig('tentang_kami')
  return (
    <ContentPage
      title="Tentang Kami"
      icon="🏢"
      content={content}
      fallback={`MANSION Realty adalah perusahaan properti terpercaya yang melayani kebutuhan jual, beli, dan sewa properti di Surabaya, Malang, dan sekitarnya.\n\nDengan tim agen profesional bersertifikasi, kami berkomitmen memberikan layanan terbaik untuk mewujudkan properti impian Anda.\n\n# Visi\nMenjadi agen properti terdepan dan terpercaya di Indonesia.\n\n# Misi\n- Memberikan pelayanan profesional dan transparan\n- Membantu klien menemukan properti terbaik sesuai kebutuhan\n- Menghadirkan agen bersertifikasi dan terlatih`}
    />
  )
}
