#!/bin/bash
set -e

PROJECT_ID="web-mansion2026"
REGION="asia-southeast2"
SERVICE_NAME="web-mansion2026"
REPO_NAME="mansion-repo"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/web"

echo "🚀 Deploy Mansion Realty ke Cloud Run"
echo "   Project : ${PROJECT_ID}"
echo "   Region  : ${REGION}"
echo "   Service : ${SERVICE_NAME}"
echo "=================================="

gcloud config set project ${PROJECT_ID}

# Buat Artifact Registry jika belum ada
gcloud artifacts repositories create ${REPO_NAME} \
  --repository-format=docker \
  --location=${REGION} \
  --description="Mansion Realty" 2>/dev/null || echo "✅ Repo sudah ada"

# Auth docker
gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet

# Build & push image via Cloud Build
cd ~/web-mansion2026
gcloud builds submit --tag ${IMAGE} .

# Deploy ke Cloud Run
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE} \
  --region ${REGION} \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --set-env-vars "NEXT_PUBLIC_GAS_API_URL=https://script.google.com/macros/s/AKfycbzOBNzrW0lOpT1J0ZkMbydfTq42SaSQiIOuV15njyCIBp6P0Grl3GQpjhVE8K_vSzROeg/exec,GAS_API_SECRET=mansion2026,NEXTAUTH_SECRET=webmansion2026authsecret,NEXT_PUBLIC_WA_OFFICE=628219880889,NEXT_PUBLIC_COMPANY_NAME=MANSION Realty,NEXT_PUBLIC_COMPANY_TAGLINE=Properti Impian Anda Investasi Terbaik Anda,NEXT_PUBLIC_COMPANY_ADDRESS=Jl. Sentra Niaga Utama Ruko Niaga Utama F-7 Citraland Surabaya,NEXT_PUBLIC_COMPANY_EMAIL=manprop26@gmail.com,NEXT_PUBLIC_COMPANY_PHONE=+628219880889,NEXT_PUBLIC_SITE_URL=https://www.mansionpro.id,NEXT_PUBLIC_SITE_DOMAIN=mansionpro.id,GOOGLE_SHEETS_ID=1iHIGVPl7l7dDEVpqHGvZxFVIL8nqUx3G_skBPzFimzI"

echo ""
echo "✅ DEPLOY SELESAI!"
gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(status.url)"
