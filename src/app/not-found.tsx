import Link from 'next/link'
export default function NotFound() {
  return (
    <div style={{ padding: '2rem', marginTop: '80px', textAlign: 'center' }}>
      <h2>404 - Halaman Tidak Ditemukan</h2>
      <Link href="/">Kembali ke Beranda</Link>
    </div>
  )
}
