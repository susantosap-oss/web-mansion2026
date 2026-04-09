# TODO — Next Session
> Dicatat: April 2026

---

## 1. Optimalisasi SEO untuk Listing
- Buat panduan praktis pengisian field listing di CRM yang SEO-friendly
- Cek implementasi `generateMetadata()` per listing detail page
  (saat ini semua listing masih pakai title/desc global — perlu custom per listing)
- Cek Schema.org fields yang sudah ada, tambahkan yang kurang
- Pertimbangkan: OG Image otomatis dari foto utama listing

---

## 2. Fitur `agen_page_listing` di CRM
- Fitur sudah ada di CRM tapi URL belum di-set (domain belum live waktu dibuat)
- Yang perlu dicek:
  - URL format yang dipakai (kemungkinan masih pakai Cloud Run URL lama)
  - Ganti ke `https://www.mansionpro.id/listings/[slug]`
  - Test link sharing dari CRM ke web publik berjalan benar
- Kemungkinan lokasi di kode: cari `agen_page` atau `listing_url` di CRM frontend

---
