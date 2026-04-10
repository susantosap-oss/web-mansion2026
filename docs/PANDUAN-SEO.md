# Panduan SEO — Mansion Realty Website
> Untuk Principal / Superadmin
> Terakhir diperbarui: April 2026

---

## Daftar Isi
1. [Apa itu SEO dan Mengapa Penting?](#1-apa-itu-seo-dan-mengapa-penting)
2. [Bagaimana SEO Bekerja di Website Ini](#2-bagaimana-seo-bekerja-di-website-ini)
3. [Pengaturan SEO di Dashboard Principal](#3-pengaturan-seo-di-dashboard-principal)
4. [Penjelasan Setiap Field SEO](#4-penjelasan-setiap-field-seo)
5. [Cara Kerja Teknis: Dari GSheets ke Google](#5-cara-kerja-teknis-dari-gsheets-ke-google)
6. [SEO Per Halaman (Otomatis)](#6-seo-per-halaman-otomatis)
7. [Sitemap & Robots.txt](#7-sitemap--robotstxt)
8. [Google Search Console — Cara Membaca Data](#8-google-search-console--cara-membaca-data)
9. [Strategi Konten SEO untuk Properti](#9-strategi-konten-seo-untuk-properti)
10. [Checklist SEO Bulanan](#10-checklist-seo-bulanan)
11. [Yang Belum Ada & Roadmap](#11-yang-belum-ada--roadmap)

---

## 1. Apa itu SEO dan Mengapa Penting?

**SEO (Search Engine Optimization)** adalah serangkaian teknik untuk membuat website muncul di halaman pertama Google ketika calon pembeli mengetik kata kunci tertentu.

### Contoh nyata untuk properti:
```
Calon pembeli ketik di Google:
→ "rumah dijual surabaya barat"
→ "apartemen murah surabaya 2026"
→ "broker properti surabaya terpercaya"
→ "KPR rumah surabaya"
```

Kalau Mansion Realty muncul di halaman 1 untuk kata kunci ini → **traffic gratis setiap hari tanpa bayar iklan**.

### Perbandingan SEO vs Iklan:
| | SEO | Google Ads / Meta Ads |
|--|-----|----------------------|
| Biaya | Gratis (butuh waktu) | Bayar per klik |
| Hasil | Lambat (3–6 bulan) | Langsung |
| Jangka panjang | Terus berjalan | Berhenti kalau iklan mati |
| Trust | Tinggi (organik) | Lebih rendah |

**SEO = Investasi jangka panjang. Iklan = Sprint jangka pendek.**

---

## 2. Bagaimana SEO Bekerja di Website Ini

### Alur Sistem:

```
Principal edit di Dashboard
        ↓
Tersimpan di Google Sheets (tab CONFIG)
        ↓
Website membaca CONFIG saat halaman dimuat
        ↓
Meta tag tampil di <head> HTML
        ↓
Googlebot baca meta tag saat crawl
        ↓
Muncul di hasil pencarian Google
```

### Komponen SEO yang sudah aktif:

| Komponen | Status | Keterangan |
|----------|--------|------------|
| Meta Title | ✅ Aktif | Judul yang muncul di Google |
| Meta Description | ✅ Aktif | Deskripsi di bawah judul di Google |
| Meta Keywords | ✅ Aktif | Kata kunci (tersimpan tapi Google sudah jarang pakai ini) |
| Open Graph (OG) | ✅ Aktif | Preview saat link dibagikan di WhatsApp/FB |
| Sitemap.xml | ✅ Aktif | Daftar semua URL untuk Google |
| Robots.txt | ✅ Aktif | Aturan untuk crawler Google |
| Schema.org Listing | ✅ Aktif | Data terstruktur untuk detail properti |
| Google Search Console | ✅ Terhubung | Monitor performa SEO |
| Cloudflare | ✅ Aktif | Keamanan + kecepatan (faktor SEO) |

---

## 3. Pengaturan SEO di Dashboard Principal

### Cara Akses:
1. Login ke `https://www.mansionpro.id/login` dengan akun **superadmin**
2. Masuk ke menu **Dashboard → tab "Pengaturan SEO"**

### Field yang bisa diedit:

```
┌─────────────────────────────────────────┐
│  ⚙️ Pengaturan SEO & CTA               │
│                                         │
│  Judul Website (SEO)                    │
│  ┌─────────────────────────────────┐    │
│  │ Mansion Realty | Properti ...   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Deskripsi Meta (SEO)                   │
│  ┌─────────────────────────────────┐    │
│  │ Temukan properti impian Anda... │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Keywords                               │
│  ┌─────────────────────────────────┐    │
│  │ properti surabaya, rumah...     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [💾 Simpan Pengaturan]                 │
└─────────────────────────────────────────┘
```

### Disimpan ke mana?
Semua nilai disimpan ke **Google Sheets tab CONFIG** dengan key:
- `seo_title` → Judul Website
- `seo_desc` → Deskripsi Meta
- `seo_keywords` → Keywords

---

## 4. Penjelasan Setiap Field SEO

### 4.1 Judul Website (`seo_title`)

**Apa ini?**
Teks yang muncul di tab browser dan sebagai judul biru di hasil pencarian Google.

**Tampilan di Google:**
```
┌────────────────────────────────────────────────┐
│ Mansion Realty | Properti Dijual Surabaya       │  ← seo_title
│ www.mansionpro.id                               │
│ Temukan rumah impian Anda di Surabaya. Pilihan  │
│ terlengkap dari agen terpercaya.                │
└────────────────────────────────────────────────┘
```

**Aturan penulisan:**
- Panjang ideal: **50–60 karakter** (lebih dari 60 akan terpotong)
- Format disarankan: `Kata Kunci Utama | Nama Brand`
- Contoh bagus: `Rumah Dijual Surabaya | Mansion Realty`
- Hindari: huruf kapital semua, tanda seru berlebihan

**Contoh untuk Mansion Realty:**
```
✅ Mansion Realty | Properti Premium Surabaya
✅ Jual Beli Rumah Surabaya | Mansion Realty
❌ MANSION REALTY - PROPERTI TERBAIK!!!
❌ Mansion Realty Website Official Portal Surabaya Indonesia  (terlalu panjang)
```

---

### 4.2 Deskripsi Meta (`seo_desc`)

**Apa ini?**
Teks dua baris di bawah judul pada hasil pencarian Google. **Tidak langsung mempengaruhi ranking** tapi sangat mempengaruhi apakah orang mau klik atau tidak.

**Tampilan di Google:**
```
┌────────────────────────────────────────────────┐
│ Mansion Realty | Properti Premium Surabaya      │
│ www.mansionpro.id                               │
│ Temukan rumah dijual, apartemen, dan kavling    │  ← seo_desc baris 1
│ terbaik di Surabaya. 100+ listing aktif, agen  │  ← seo_desc baris 2
│ berpengalaman, KPR mudah. Konsultasi gratis.   │
└────────────────────────────────────────────────┘
```

**Aturan penulisan:**
- Panjang ideal: **150–160 karakter**
- Harus mengandung kata kunci utama
- Tambahkan **call to action** (ajakan): "Cari sekarang", "Konsultasi gratis", "Lihat pilihan"
- Tulis untuk manusia, bukan robot

**Contoh untuk Mansion Realty:**
```
✅ Temukan 100+ properti dijual & disewa di Surabaya.
   Rumah, apartemen, kavling, gudang. Agen terpercaya,
   KPR mudah. Cari sekarang!

✅ Broker properti Surabaya terpercaya sejak 2020.
   Jual beli sewa rumah, apartemen & kavling premium.
   Konsultasi gratis via WhatsApp.
```

---

### 4.3 Keywords (`seo_keywords`)

**Apa ini?**
Daftar kata kunci yang relevan dengan bisnis, dipisah koma.

**Penting untuk dipahami:**
> Google sudah **tidak lagi menggunakan** meta keywords sebagai faktor ranking sejak 2009. Field ini lebih berguna sebagai **catatan internal** untuk mengingatkan kata kunci apa yang sedang difokuskan.

**Yang benar-benar mempengaruhi SEO** adalah keyword yang muncul di:
- Judul halaman (seo_title)
- Deskripsi (seo_desc)
- Konten artikel/berita
- Judul dan deskripsi listing properti

**Contoh pengisian:**
```
properti surabaya, rumah dijual surabaya,
broker properti surabaya, KPR surabaya,
apartemen surabaya murah, kavling surabaya barat,
mansion realty, agen properti surabaya terpercaya
```

---

## 5. Cara Kerja Teknis: Dari GSheets ke Google

### Flow lengkap:

```
1. Principal simpan seo_title di Dashboard
           ↓
2. POST /api/config → {key: "seo_title", value: "..."}
           ↓
3. Tulis ke Google Sheets CONFIG tab:
   | seo_title | Mansion Realty | Properti... | 2026-04-09 |
           ↓
4. Saat halaman dibuka, Next.js baca CONFIG:
   GET /api/config?key=seo_title
           ↓
5. Dimasukkan ke metadata Next.js:
   export const metadata = {
     title: configValue.seo_title,
     description: configValue.seo_desc,
   }
           ↓
6. Next.js render HTML dengan meta tag:
   <title>Mansion Realty | Properti...</title>
   <meta name="description" content="..."/>
   <meta property="og:title" content="..."/>
           ↓
7. Googlebot crawl halaman → baca meta tag
           ↓
8. Tampil di hasil pencarian Google (1–7 hari)
```

### Open Graph — Preview di WhatsApp & Media Sosial:

Saat link `mansionpro.id` dibagikan di WhatsApp atau Facebook, tampilan preview-nya diambil dari tag Open Graph:

```
┌──────────────────────────────────┐
│  [Logo/Gambar]                   │
│  Mansion Realty | Properti...    │  ← og:title
│  Temukan properti impian Anda... │  ← og:description
│  www.mansionpro.id               │
└──────────────────────────────────┘
```

Tag OG saat ini menggunakan nilai yang sama dengan seo_title dan seo_desc.

---

## 6. SEO Per Halaman (Otomatis)

Selain setting global, beberapa halaman sudah punya SEO otomatis:

### Halaman Listing Detail (`/listings/[slug]`)

Setiap listing properti sudah memiliki **Schema.org markup** otomatis:

```json
{
  "@type": "RealEstateListing",
  "name": "Rumah Mewah Citraland Surabaya",
  "description": "Deskripsi dari CRM...",
  "price": "2500000000",
  "priceCurrency": "IDR",
  "address": {
    "addressLocality": "Surabaya",
    "addressRegion": "Jawa Timur"
  }
}
```

Ini membuat Google **mengerti** bahwa halaman ini adalah listing properti, bukan artikel biasa. Hasilnya bisa muncul sebagai **rich result** di Google (dengan harga, lokasi, dll).

### Sitemap Dinamis (Otomatis)

Setiap listing dan proyek baru yang masuk CRM **otomatis masuk sitemap.xml**. Google akan menemukan halaman baru lebih cepat.

```xml
<url>
  <loc>https://www.mansionpro.id/listings/rumah-citraland-surabaya-123</loc>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
  <lastmod>2026-04-09</lastmod>
</url>
```

---

## 7. Sitemap & Robots.txt

### Sitemap.xml
**URL:** `https://www.mansionpro.id/sitemap.xml`

Berisi semua halaman yang ingin diindeks Google:

| Halaman | Priority | Update |
|---------|----------|--------|
| Homepage | 1.0 | Daily |
| /listings | 0.9 | Daily |
| /projects | 0.9 | Weekly |
| /agents | 0.7 | Weekly |
| /news | 0.7 | Weekly |
| /calculator | 0.6 | Monthly |
| Setiap listing detail | 0.8 | Weekly |
| Setiap project detail | 0.8 | Weekly |

**Priority** bukan jaminan ranking, tapi memberi sinyal ke Google halaman mana yang lebih penting.

### Robots.txt
**URL:** `https://www.mansionpro.id/robots.txt`

Mengatur halaman mana yang **boleh** dan **tidak boleh** diindeks Google:

```
✅ Boleh diindeks:     / (semua halaman publik)
❌ Tidak boleh:        /dashboard/ (admin)
❌ Tidak boleh:        /login
❌ Tidak boleh:        /api/ (endpoint teknis)
```

> Halaman dashboard dan login tidak perlu muncul di Google — itu rahasia internal.

---

## 8. Google Search Console — Cara Membaca Data

Search Console sudah terhubung di `https://www.mansionpro.id`.
Login di: [search.google.com/search-console](https://search.google.com/search-console)

### Menu yang paling penting:

#### 📊 Performance → Search Results
Menampilkan data pencarian organik:

| Metrik | Artinya |
|--------|---------|
| **Total Clicks** | Berapa kali orang klik link kamu dari Google |
| **Total Impressions** | Berapa kali website muncul di hasil pencarian |
| **Average CTR** | Click-Through Rate = Klik ÷ Impressions × 100% |
| **Average Position** | Rata-rata posisi di Google (1 = paling atas) |

**CTR yang bagus:** > 3% untuk properti
**Posisi target:** < 10 (halaman 1 Google)

#### 🔍 Queries (Kata Kunci)
Lihat kata kunci apa yang dipakai orang untuk menemukan website kamu.

**Analisis yang bisa dilakukan:**
```
Kata kunci dengan Impressions tinggi tapi CTR rendah
→ Artinya: website muncul tapi orang tidak klik
→ Solusi: Perbaiki seo_title dan seo_desc agar lebih menarik

Kata kunci dengan Position 4-10 (hampir halaman 1)
→ Artinya: potensial besar, sedikit effort bisa naik ke top 3
→ Solusi: Buat artikel/konten tentang kata kunci tersebut
```

#### 📄 Pages
Halaman mana yang paling banyak mendapat traffic dari Google.

**Gunakan data ini untuk:**
- Tahu konten apa yang paling diminati
- Fokus optimalkan halaman yang sudah hampir masuk top 3

#### 🗺️ Sitemaps
Monitor status sitemap yang sudah disubmit.
Pastikan statusnya **"Success"** (bukan "Couldn't fetch").

#### 🔎 URL Inspection
Masukkan URL spesifik untuk cek apakah sudah diindeks Google dan kapan terakhir di-crawl.

---

## 9. Strategi Konten SEO untuk Properti

SEO teknis (meta tag, sitemap) hanya fondasi. **Konten** adalah faktor terbesar untuk ranking.

### 9.1 Optimasi Deskripsi Listing di CRM

Setiap listing di CRM punya field **Deskripsi**. Ini yang muncul di halaman detail properti dan dibaca Google.

**Deskripsi listing yang bagus untuk SEO:**
```
❌ Buruk:
"Rumah bagus, lokasi strategis, harga nego"

✅ Bagus:
"Rumah 2 lantai di kawasan Citraland Surabaya Barat, dekat
pintu tol Romokalisari. Luas tanah 150m², luas bangunan 200m²,
4 kamar tidur, 3 kamar mandi. Dilengkapi carport 2 mobil,
taman depan, dan dapur bersih. Cocok untuk keluarga yang
menginginkan hunian nyaman di area premium Surabaya.
Sertifikat SHM, siap huni. Harga Rp 2,5 Miliar, KPR dibantu."
```

**Kata kunci yang harus ada di deskripsi:**
- Nama kawasan / perumahan (Citraland, Pakuwon, dll)
- Kota + area (Surabaya Barat, Surabaya Timur)
- Tipe properti (rumah, apartemen, kavling, ruko)
- Spesifikasi penting (luas tanah, jumlah kamar)
- Status (SHM, strata title, siap huni, indent)

### 9.2 Artikel Berita di Website

Menu **Berita** di website adalah senjata SEO terkuat untuk jangka panjang.

**Topik artikel yang bagus untuk SEO properti:**
```
✅ "Harga Rumah di Citraland Surabaya 2026"
✅ "Panduan KPR untuk Pertama Kali Beli Rumah"
✅ "5 Lokasi Investasi Properti Terbaik di Surabaya"
✅ "Perbedaan SHM, HGB, dan Strata Title yang Wajib Kamu Tahu"
✅ "Review Perumahan [nama] Surabaya — Kelebihan dan Kekurangan"
✅ "Cara Hitung Biaya Notaris dan BPHTB saat Beli Rumah"
```

**Frekuensi ideal:** 2–4 artikel per bulan

**Formula artikel SEO:**
```
Panjang: minimal 600 kata
Kata kunci utama: ada di judul + paragraf pertama + 2-3x di body
Gambar: minimal 1, dengan nama file deskriptif
(contoh: rumah-dijual-citraland-surabaya.jpg bukan IMG_1234.jpg)
```

### 9.3 Google Business Profile

Ini BERBEDA dari website tapi sangat penting untuk **pencarian lokal**:

```
Orang ketik: "agen properti surabaya" di Google Maps
→ Muncul card bisnis dengan:
  - Alamat kantor
  - Rating & review
  - Foto kantor
  - Jam operasional
  - Tombol "Hubungi"
```

**Daftar di:** [business.google.com](https://business.google.com)
Gunakan alamat: Jl. Sentra Niaga Utama Ruko F-7 Citraland Surabaya

---

## 10. Checklist SEO Bulanan

Lakukan ini setiap bulan di Google Search Console:

### Minggu 1 — Monitor
- [ ] Buka Search Console → Performance → bandingkan dengan bulan lalu
- [ ] Catat 5 kata kunci dengan impressions tertinggi
- [ ] Catat halaman dengan CTR terendah (perlu perbaikan title/desc)
- [ ] Cek apakah ada halaman dengan posisi 4–10 (potensial naik)

### Minggu 2 — Konten
- [ ] Buat 1–2 artikel berita dengan kata kunci yang ditemukan minggu 1
- [ ] Update deskripsi 3–5 listing lama agar lebih detail dan kaya kata kunci

### Minggu 3 — Teknis
- [ ] URL Inspection → cek 5 halaman listing baru sudah terindeks?
- [ ] Kalau belum terindeks → klik "Request Indexing"
- [ ] Pastikan tidak ada Coverage Errors di Search Console

### Minggu 4 — Optimasi
- [ ] Update seo_title dan seo_desc di dashboard jika CTR rendah
- [ ] Review artikel bulan lalu — perlu diperbarui?
- [ ] Cek kecepatan website via PageSpeed Insights

---

## 11. Yang Belum Ada & Roadmap

Beberapa fitur SEO lanjutan yang bisa dikembangkan ke depan:

### Prioritas Tinggi:
| Fitur | Manfaat | Status |
|-------|---------|--------|
| OG Image per listing | Preview gambar properti saat share WA/FB | ✅ Done (April 2026) |
| generateMetadata() per listing | Custom title & desc per properti di Google | ✅ Done (April 2026) |
| Breadcrumb Schema | Tampilan "Beranda > Listing > Nama Properti" di Google | ✅ Done (April 2026) |
| Schema.org fields lengkap | kamarTidur, kamarMandi, luas tanah/bangunan, carport | ✅ Done (April 2026) |

### Prioritas Sedang:
| Fitur | Manfaat |
|-------|---------|
| NewsArticle Schema | Artikel berita muncul sebagai rich result di Google |
| Organization Schema | Informasi bisnis terstruktur di Google |
| FAQ Schema | Pertanyaan umum muncul langsung di hasil pencarian |
| Canonical tags per halaman | Hindari duplicate content |

### Catatan Penting:
> SEO per listing detail sudah diimplementasikan (April 2026): `generateMetadata()`, OG Image dari foto utama, Breadcrumb Schema, dan Schema.org fields lengkap (kamar tidur, kamar mandi, luas tanah, luas bangunan, carport).

---

## Ringkasan — Yang Perlu Dilakukan Principal

### Sekarang (Langsung bisa dilakukan):
1. **Dashboard → Pengaturan SEO** → isi judul dan deskripsi yang optimal
2. **Input Berita** → mulai buat artikel konten secara rutin
3. **Deskripsi listing di CRM** → pastikan semua listing punya deskripsi lengkap

### Setiap bulan:
1. Buka Google Search Console → monitor performa
2. Buat 2–4 artikel berita
3. Update listing lama yang deskripsinya masih pendek

### Jangka panjang (3–6 bulan):
- Dengan konten rutin dan listing lengkap, website akan mulai muncul di halaman 1 Google untuk kata kunci lokal Surabaya
- Target: 500+ kunjungan organik per bulan dalam 6 bulan

---

*Dokumen ini dibuat berdasarkan struktur kode web-mansion2026 per April 2026.*
*Update dokumen ini setiap ada perubahan fitur SEO.*
