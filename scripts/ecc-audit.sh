#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ECC="/root/.codex/.tmp/marketplaces/ecc"
if [[ ! -f "$ECC/scripts/harness-audit.js" ]]; then
 echo "ECC absent: $ECC" >&2; exit 2
fi
export NODE_PATH="/tmp/ecc-audit-deps/node_modules${NODE_PATH:+:$NODE_PATH}"
node "$ECC/scripts/harness-audit.js" repo --root "$ROOT" --format text
