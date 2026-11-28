#!/usr/bin/env bash
# Suite locale checkout-order : mock PostgREST (127.0.0.1:18999) + Deno (127.0.0.1:8000). Aucun identifiant reel.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
DENO="${DENO:-deno}"
OUT="$(mktemp -d)"
if ss -ltn | grep -qE ":(8000|18999) "; then echo "ports 8000/18999 deja occupes: arret" >&2; exit 2; fi
export WRITE_LOG="$OUT/writes.jsonl"; : > "$WRITE_LOG"
cleanup() { kill "${MOCK_PID:-}" "${DENO_PID:-}" 2>/dev/null || true; wait 2>/dev/null || true; }
trap cleanup EXIT
node "$HERE/mock-db.mjs" >"$OUT/mock.log" 2>&1 & MOCK_PID=$!
SUPABASE_URL=http://127.0.0.1:18999 SUPABASE_SERVICE_ROLE_KEY=local-mock-not-real \
  "$DENO" run --no-prompt --node-modules-dir=none --allow-net=127.0.0.1:18999,127.0.0.1:8000,jsr.io,registry.npmjs.org \
  --allow-env=SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,ENABLE_CRYPTO_PAYMENT,ENABLE_EXTERNAL_PAYMENT_LINK \
  --allow-read="$HERE/../../.." "$HERE/wrapper.ts" >"$OUT/deno.log" 2>&1 & DENO_PID=$!
for _ in $(seq 1 120); do curl -s -o /dev/null http://127.0.0.1:8000/ && break; sleep 1; done
WRITES_FILE="$WRITE_LOG" python3 -B "$HERE/run-suite.py"
