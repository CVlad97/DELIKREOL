#!/usr/bin/env bash
# Optional, explicitly invoked Perplexity CLI research. Never automatically spend API credits.
set -euo pipefail
if [[ "${1:-}" == "--help" || $# -eq 0 ]]; then
  echo 'Usage: PERPLEXITY_ALLOW_PAID_SEARCH=1 scripts/agents/perplexity-research.sh "query"'
  echo 'Requires locally configured Perplexity API credentials; API searches may be billed.'
  exit 0
fi
if [[ "${PERPLEXITY_ALLOW_PAID_SEARCH:-0}" != '1' ]]; then
  echo 'BLOCKED: Perplexity API search can incur charges. Set PERPLEXITY_ALLOW_PAID_SEARCH=1 after explicit approval.' >&2
  exit 3
fi
if ! command -v pplx >/dev/null 2>&1; then
  echo 'BLOCKED: pplx CLI is not installed.' >&2
  exit 4
fi
out="${PPLX_OUTPUT_DIR:-/tmp/delikreol-perplexity-research}"
mkdir -p "$out"
pplx search web "$@" --intent 'Identify and verify official sources for DELIKREOL business partner identity, logo usage and marketplace compliance' --limit 5 --output-dir "$out"
