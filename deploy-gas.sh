#!/bin/bash
# Deploy Google Apps Script ke project GAS tanpa copy-paste manual
# Deployment ID = URL permanen yang sudah ada di Cloud Run env var
set -e

DEPLOYMENT_ID="AKfycbxK7R5QM3H_4G97UfwHmwL2LmZrXVYggoY3I6VTCfG8RwIC6wRmacwNnOeptMU_X2O65A"

echo "📦 Push kode GAS ke Google Apps Script..."
clasp push --force

echo "🚀 Update deployment (URL tetap sama)..."
clasp deploy --deploymentId "$DEPLOYMENT_ID" --description "Auto deploy $(date '+%Y-%m-%d %H:%M')"

echo ""
echo "✅ GAS berhasil diupdate!"
echo "   URL: https://script.google.com/macros/s/${DEPLOYMENT_ID}/exec"
echo ""
echo "💡 Tip: Jalankan 'createAllTriggers' di GAS Editor jika trigger belum aktif."
