#!/bin/bash
# Deploy Google Apps Script ke project GAS tanpa copy-paste manual
# Deployment ID = URL permanen yang sudah ada di Cloud Run env var
set -e

DEPLOYMENT_ID="AKfycbyWH8k07x63RW1W0OLeyrLDtIIv26Ixs_kcSy8_8atAH1NJtY8u-rWNQ45GeAbT0T6itA"

echo "📦 Push kode GAS ke Google Apps Script..."
clasp push --force

echo "🚀 Update deployment (URL tetap sama)..."
clasp deploy --deploymentId "$DEPLOYMENT_ID" --description "Auto deploy $(date '+%Y-%m-%d %H:%M')"

echo ""
echo "✅ GAS berhasil diupdate!"
echo "   URL: https://script.google.com/macros/s/${DEPLOYMENT_ID}/exec"
echo ""
echo "⚠️  WAJIB setelah deploy GAS: Buka GAS Editor → Run → createAllTriggers"
echo "   (Ini memperbarui trigger & langsung revalidate data web)"
echo "   URL: https://script.google.com/home/projects/$(cat ../.clasp.json 2>/dev/null | grep scriptId | sed 's/.*: *\"//;s/\".*//' || echo 'SCRIPT_ID')/edit"
