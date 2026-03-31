import { Metadata } from 'next'
import ContentPage, { getContentConfig } from '../ContentPage'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Kebijakan Privasi' }

export default async function PrivacyPage() {
  const content = await getContentConfig('kebijakan_privasi')
  return (
    <ContentPage
      title="Kebijakan Privasi"
      icon="🔒"
      content={content}
      fallback={`MANSION Realty menghormati privasi Anda dan berkomitmen melindungi data pribadi yang Anda berikan.\n\n# Data yang Kami Kumpulkan\n- Nama dan nomor WhatsApp (untuk keperluan konsultasi)\n- Preferensi properti\n- Riwayat interaksi dengan agen\n\n# Penggunaan Data\nData Anda digunakan semata-mata untuk menghubungkan Anda dengan agen yang tepat dan memberikan rekomendasi properti yang sesuai.\n\n# Keamanan\nKami tidak menjual atau membagikan data pribadi Anda kepada pihak ketiga tanpa persetujuan Anda.\n\n# Hubungi Kami\nJika ada pertanyaan mengenai kebijakan privasi, hubungi kami melalui WhatsApp.`}
    />
  )
}
