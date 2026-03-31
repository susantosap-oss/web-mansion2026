import { Metadata } from 'next'
import ContentPage, { getContentConfig } from '../ContentPage'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Syarat & Ketentuan' }

export default async function TermsPage() {
  const content = await getContentConfig('syarat_ketentuan')
  return (
    <ContentPage
      title="Syarat & Ketentuan"
      icon="📋"
      content={content}
      fallback={`Dengan menggunakan layanan MANSION Realty, Anda menyetujui syarat dan ketentuan berikut.\n\n# Layanan\nMANSION Realty menyediakan platform untuk menghubungkan calon pembeli/penyewa dengan agen properti profesional.\n\n# Kewajiban Pengguna\n- Memberikan informasi yang akurat\n- Menggunakan layanan untuk tujuan yang sah\n- Tidak menyalahgunakan platform\n\n# Batasan Tanggung Jawab\nMANSION Realty bertindak sebagai perantara dan tidak bertanggung jawab atas transaksi yang terjadi di luar pengawasan kami.\n\n# Perubahan Ketentuan\nKami berhak mengubah syarat dan ketentuan ini sewaktu-waktu dengan pemberitahuan sebelumnya.`}
    />
  )
}
