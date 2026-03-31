import { Metadata } from 'next'
import ContentPage, { getContentConfig } from '../ContentPage'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Hubungi Kami' }

export default async function ContactPage() {
  const content = await getContentConfig('hubungi_kami')
  const address = process.env.NEXT_PUBLIC_COMPANY_ADDRESS || 'Jl. Sentra Niaga Utama Ruko Niaga Utama F-7 Citraland Surabaya'
  const phone   = process.env.NEXT_PUBLIC_COMPANY_PHONE   || '+628219880889'
  const email   = process.env.NEXT_PUBLIC_COMPANY_EMAIL   || 'manprop26@gmail.com'

  const fallback = `Kami siap membantu Anda menemukan properti impian.\n\n# Kantor Utama\n${address}\n\n# Kontak\n- WhatsApp: ${phone}\n- Email: ${email}\n\n# Jam Operasional\n- Senin – Sabtu: 09.00 – 18.00 WIB\n- Minggu: 10.00 – 15.00 WIB`

  return (
    <ContentPage
      title="Hubungi Kami"
      icon="📞"
      content={content}
      fallback={fallback}
    />
  )
}
