# Panduan Penulisan Artikel Berita — Mansion Realty

> Dokumen ini menjelaskan cara menulis artikel berita agar fitur **"Properti Terkait"** bekerja otomatis dan SEO optimal.
>
> Sistem membaca kolom `Tags` di GSheet NEWS → mencocokkan ke kolom `Kota` + `Kecamatan` + `Judul` di GSheet LISTINGS → menampilkan 2–4 kartu properti secara otomatis di bawah setiap artikel.

---

## 1. Kolom `Tags` di GSheet NEWS adalah Kuncinya

Isi `Tags` harus **sama persis** (case-insensitive) dengan data di sheet LISTINGS, khususnya kolom `Kota` dan `Kecamatan`.

| ✅ Benar | ❌ Tidak Match |
|---|---|
| `Surabaya Barat, Citraland, Lakarsantri` | `Sby Barat` (singkatan) |
| `Sidoarjo, Menganti` | `Surabaya-Barat` (pakai dash) |
| `Rumah, KPR` | `Rmh` (disingkat) |

**Format pengisian Tags:** pisah dengan koma, minimal 2–3 kata kunci.

```
Tags: Citraland, Surabaya Barat, Surabaya, Rumah
```

---

## 2. Struktur Artikel yang Ideal

### Format Judul

```
[Tipe Properti] di [Lokasi] — [Angle/Hook]
```

**Contoh judul yang baik:**
- `Rumah Minimalis di Citraland Makin Diminati, Ini Alasannya`
- `KPR Rumah di Surabaya Barat: Panduan Lengkap 2026`
- `Investasi Ruko di Sidoarjo: Potensi dan Risikonya`
- `Apartemen di Surabaya Pusat: Mana yang Paling Worth It?`

### Format Ringkasan (Summary)

1–2 kalimat yang mengandung **lokasi + tipe properti**. Google sering menggunakan ini untuk cuplikan hasil pencarian (meta description otomatis).

```
Contoh:
Kawasan Citraland Surabaya Barat terus berkembang sebagai pilihan hunian
premium dengan harga yang masih kompetitif dibanding kawasan lain di Surabaya.
```

---

## 3. Pola Artikel per Kategori

| Kategori | Pola Judul | Tags yang Disarankan |
|---|---|---|
| **Berita Properti** | `Harga Rumah di [Lokasi] Naik X% di 2026` | `[Lokasi], [Kota], Rumah` |
| **Tips & Trik** | `Cara Pilih Rumah di [Lokasi] untuk Keluarga` | `[Lokasi], [Kota], [Tipe]` |
| **KPR & Pembiayaan** | `Simulasi KPR Apartemen di [Kota] 2026` | `[Kota], Apartemen, KPR` |
| **Investasi** | `Potensi Ruko di [Kawasan] sebagai Aset Bisnis` | `[Kawasan], [Kota], Ruko` |
| **Regulasi** | `Aturan Baru KPR Subsidi untuk Rumah di [Kota]` | `[Kota], KPR, Subsidi` |

---

## 4. Anchor Text Otomatis — Sistem Sudah Handle

Sistem menggunakan **judul listing aslinya** dari CRM sebagai anchor text, contoh:

> *"Rumah 3KT Siap Huni di Citraland Surabaya"* → link ke halaman detail listing

Implikasinya: pastikan **Judul listing di CRM deskriptif** dan mengandung lokasi.

| ✅ Judul Listing yang Baik | ❌ Judul Listing yang Buruk |
|---|---|
| `Rumah Minimalis LT60 Citraland Surabaya Siap KPR` | `Listing #001` |
| `Ruko 2 Lantai Strategis Jl. Raya Menganti Sidoarjo` | `Ruko dijual murah` |
| `Apartemen Studio Pakuwon City Surabaya Full Furnished` | `Apt unit bagus` |

---

## 5. Checklist Sebelum Publish Artikel

- [ ] Judul mengandung nama **lokasi** + **tipe properti**
- [ ] `Tags` diisi minimal 2–3 kata kunci lokasi (pisah koma)
- [ ] Ejaan Tags sesuai dengan kolom `Kota`/`Kecamatan` di sheet LISTINGS
- [ ] `Ringkasan` (Summary) 1–2 kalimat, ada nama kota
- [ ] Konten minimal **300 kata**
- [ ] Gambar cover tersedia (dipakai untuk OG tag dan thumbnail)
- [ ] Kategori dipilih yang sesuai

---

## 6. Contoh Artikel Lengkap yang Optimal

### Di GSheet NEWS

| Field | Isi |
|---|---|
| **Judul** | Investasi Rumah di Sidoarjo Barat: Pilihan Terbaik 2026 |
| **Kategori** | Investasi |
| **Tags** | `Sidoarjo, Sidoarjo Barat, Rumah, Menganti` |
| **Ringkasan** | Kawasan Sidoarjo Barat mengalami pertumbuhan signifikan sebagai alternatif hunian terjangkau di dekat Surabaya. |
| **Konten** | _(400+ kata membahas kawasan, infrastruktur, potensi investasi)_ |
| **Foto Cover** | URL gambar dari Cloudinary |

### Hasil di Web

Di bawah artikel ini, sistem otomatis menampilkan listing seperti:

```
┌─────────────────────────────────────────────────────┐
│ 🏠 Properti Terkait di Sidoarjo Barat               │
│                                                     │
│ [Foto] Rumah 3KT Menganti...  [Foto] Ruko Sidoarjo │
│ Dijual · Rp 388 Jt            Dijual · Rp 650 Jt   │
│ [Lihat Unit →]                [Lihat Unit →]        │
└─────────────────────────────────────────────────────┘
```

Tanpa konfigurasi manual apapun — sepenuhnya otomatis berdasarkan Tags.

---

## Referensi Kata Kunci Lokasi yang Valid

Gunakan kata kunci ini di Tags agar match dengan data listing:

```
Kota     : Surabaya, Sidoarjo, Malang, Batu, Gresik, Mojokerto
Kawasan  : Citraland, Pakuwon, Bukit Darmo, Surabaya Barat,
           Surabaya Timur, Surabaya Selatan, Surabaya Utara
Kecamatan: Lakarsantri, Menganti, Wiyung, Tandes, Gubeng,
           Rungkut, Wonokromo (sesuai data di sheet LISTINGS)
Tipe     : Rumah, Apartemen, Ruko, Kavling, Gudang
```

> **Tip:** Buka sheet LISTINGS, filter kolom `Kota` dan `Kecamatan` untuk melihat nilai yang tersedia, lalu gunakan nilai-nilai tersebut sebagai Tags di artikel.
