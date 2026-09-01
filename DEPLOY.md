# Deploy Guide — Mansion Realty Web

## Stack
- **Framework:** Next.js 14 (standalone output)
- **Container:** Docker (node:20-alpine)
- **Registry:** Google Artifact Registry
- **Hosting:** Google Cloud Run (`asia-southeast2`)
- **CDN/Proxy:** Cloudflare (Free Plan) — **tanpa GCP Load Balancer**
- **Domain:** https://www.mansionpro.id

---

## Prasyarat

- `gcloud` CLI sudah terinstall dan login:
  ```bash
  gcloud auth login
  gcloud config set project web-mansion2026
  ```
- Docker tidak diperlukan di lokal — build dilakukan via **Cloud Build** di GCP.

---

## Deploy (Manual)

### Cara cepat — jalankan script:
```bash
bash deploy.sh
```

### Cara manual step-by-step:

**1. Set project GCP**
```bash
gcloud config set project web-mansion2026
```

**2. Build image via Cloud Build & push ke Artifact Registry**
```bash
gcloud builds submit \
  --tag asia-southeast2-docker.pkg.dev/web-mansion2026/mansion-repo/web .
```

**3. Deploy ke Cloud Run**
```bash
gcloud run deploy web-mansion2026 \
  --image asia-southeast2-docker.pkg.dev/web-mansion2026/mansion-repo/web \
  --region asia-southeast2 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --set-env-vars "NEXT_PUBLIC_GAS_API_URL=...,GOOGLE_SHEETS_ID=..."
```

> Untuk daftar env vars lengkap lihat `deploy.sh`.

---

## Info Infrastruktur

| Item | Value |
|------|-------|
| GCP Project ID | `web-mansion2026` |
| Region | `asia-southeast2` (Jakarta) |
| Cloud Run Service | `web-mansion2026` |
| Artifact Registry | `asia-southeast2-docker.pkg.dev/web-mansion2026/mansion-repo/web` |
| Cloud Build Bucket | `gs://web-mansion2026_cloudbuild` |
| Service Account | `susanto.mansion@gmail.com` |
| Memory | 1Gi |
| CPU | 1 |
| Min instances | 0 (scale to zero) |
| Max instances | 3 |

---

## Env Variables yang Di-set di Cloud Run

| Key | Keterangan |
|-----|------------|
| `GOOGLE_SHEETS_ID` | ID Google Sheet utama (data listing, agen, config) |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account untuk akses Sheets API |
| `GOOGLE_PRIVATE_KEY` | Private key service account (set manual di Console) |
| `NEXT_PUBLIC_GAS_API_URL` | URL Google Apps Script (fallback write ke Sheet) |
| `GAS_API_SECRET` | Secret token untuk GAS API |
| `NEXTAUTH_SECRET` | Secret untuk auth session |
| `NEXT_PUBLIC_SITE_URL` | `https://www.mansionpro.id` |
| `NEXT_PUBLIC_SITE_DOMAIN` | `mansionpro.id` |
| `NEXT_PUBLIC_WA_OFFICE` | Nomor WhatsApp kantor |
| `NEXT_PUBLIC_COMPANY_NAME` | Nama perusahaan |
| `NEXT_PUBLIC_COMPANY_*` | Info kontak perusahaan lainnya |

> `GOOGLE_PRIVATE_KEY` dan `GOOGLE_SERVICE_ACCOUNT_EMAIL` **tidak ada di deploy.sh** karena sensitif.
> Set manual via: **GCP Console → Cloud Run → web-mansion2026 → Edit → Variables & Secrets**

---

## Cek Status Deploy

```bash
# Lihat URL service aktif
gcloud run services describe web-mansion2026 \
  --region=asia-southeast2 \
  --format="value(status.url)"

# Lihat semua revisi
gcloud run revisions list --service=web-mansion2026 --region=asia-southeast2

# Lihat log realtime
gcloud run services logs tail web-mansion2026 --region=asia-southeast2
```

---

## Arsitektur Domain (Tanpa Load Balancer)

> **PENTING:** GCP Load Balancer sudah dihapus untuk efisiensi biaya.
> Jangan buat ulang Load Balancer. Gunakan arsitektur Cloudflare Worker di bawah.

### Alur Traffic
```
User → Cloudflare → Cloudflare Worker → Cloud Run (web-mansion2026)
mansionpro.id → 301 redirect → www.mansionpro.id (via Cloudflare Redirect Rule)
```

### Konfigurasi Cloudflare (jangan diubah)

**DNS Records:**
| Name | Type | Content | Proxy |
|------|------|---------|-------|
| `@` (mansionpro.id) | CNAME | `web-mansion2026-cb5stice7a-et.a.run.app` | Proxied ☁️ |
| `www` | CNAME | `web-mansion2026-cb5stice7a-et.a.run.app` | Proxied ☁️ |
| `crm` | CNAME | `crm-broker-properti-vnd6joen4a-et.a.run.app` | Proxied ☁️ |

**Cloudflare Worker** (`cold-wildflower-0c6f`):
- Route: `www.mansionpro.id/*`
- Fungsi: reverse proxy ke Cloud Run, menggantikan Load Balancer
- SSL Mode: Full (bukan Strict)

**Cloudflare Redirect Rule** (`apex to www`):
- Kondisi: `Hostname equals mansionpro.id`
- Action: 301 redirect ke `https://www.mansionpro.id`

### Jika Cloud Run URL Berubah Setelah Redeploy
Cloud Run URL **tidak berubah** selama service name dan region sama. Jika karena sesuatu hal URL berubah, update CNAME di Cloudflare DNS + kode Worker:
1. Cloudflare DNS → update CNAME content ke URL baru
2. Workers & Pages → `cold-wildflower-0c6f` → Edit Code → update `targetUrl`

### Kenapa Tidak Pakai GCP Load Balancer
- Load Balancer GCP biaya ~$18-25/bulan (forwarding rule + SSL cert)
- Cloudflare Worker Free Plan: 100.000 request/hari, gratis
- Cloud Run domain mapping tidak tersedia di region `asia-southeast2`

---

## Build Lokal (tanpa deploy)

```bash
npm run build
```

Build lokal hanya untuk testing — tidak menggunakan Docker.
Deploy ke Cloud Run selalu melalui Cloud Build di GCP.

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `gcloud` tidak login | `gcloud auth login` |
| Build gagal di Cloud Build | Cek log di GCP Console → Cloud Build |
| Service tidak bisa akses Google Sheet | Cek `GOOGLE_PRIVATE_KEY` sudah di-set di Cloud Run env vars |
| Domain tidak terarah | Cek Cloudflare DNS (CNAME proxied) + Worker route `www.mansionpro.id/*` aktif |
| Error 525 SSL Handshake | Pastikan Cloudflare SSL mode = **Full** (bukan Strict). JANGAN pakai Load Balancer lagi |
| Apex domain 404 | Pastikan Redirect Rule `apex to www` aktif di Cloudflare. Hapus Worker route untuk `mansionpro.id/*` jika ada |
| Container crash saat start | `gcloud run services logs tail web-mansion2026 --region=asia-southeast2` |
