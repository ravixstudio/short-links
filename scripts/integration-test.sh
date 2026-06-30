#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8002}"
API_KEY="${API_KEY:-change-me-in-production}"
LONG_URL="${LONG_URL:-https://innoventry.in/rest/public/base/FileSharingService/getDocument?companyid=1&fileToDownload=test.pdf}"

echo "Creating short link..."
CREATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/v1/links" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"long_url\":\"${LONG_URL}\"}")

echo "${CREATE_RESPONSE}"

LINK=$(echo "${CREATE_RESPONSE}" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); if(!d.link) process.exit(1); process.stdout.write(d.link)")
SLUG=$(echo "${CREATE_RESPONSE}" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); if(!d.slug) process.exit(1); process.stdout.write(d.slug)")

echo "Resolving ${SLUG}..."
LOCATION=$(curl -s -o /dev/null -D - "${BASE_URL}/${SLUG}" | awk 'tolower($1)=="location:" {print $2}' | tr -d '\r')
if [[ "${LOCATION}" != "${LONG_URL}" ]]; then
  echo "Expected redirect to long URL, got: ${LOCATION}"
  exit 1
fi

echo "Integration test passed."
