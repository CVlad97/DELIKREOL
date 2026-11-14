#!/usr/bin/env bash
# DELIKREOL — vérification du durcissement, depuis l'extérieur du VPS
# (votre poste, le sandbox, n'importe où). Lecture seule, ne modifie rien.
#   bash verify.sh [hote]        # défaut : delikreol.com
set -uo pipefail
H="${1:-delikreol.com}"
rc=0
ok()   { printf '  ✅ %s\n' "$*"; }
ko()   { printf '  ❌ %s\n' "$*"; rc=1; }
warn() { printf '  ⚠️  %s\n' "$*"; }

echo "=== 1. En-têtes de sécurité (racine et routes profondes) ==="
for path in / /admin/ /catalogue/; do
  hdr=$(curl -sS -m 15 -o /dev/null -D - "https://$H$path")
  for h in strict-transport-security x-content-type-options x-frame-options referrer-policy permissions-policy; do
    if printf '%s' "$hdr" | grep -qi "^$h:"; then ok "$path$h"
    else ko "$path manque $h"; fi
  done
  if printf '%s' "$hdr" | grep -qi '^content-security-policy-report-only:'; then warn "$path CSP présente en report-only (attendu en phase 1)"
  elif printf '%s' "$hdr" | grep -qi '^content-security-policy:'; then ok "$path CSP appliquée"
  else warn "$path aucune CSP"; fi
done

echo ""
echo "=== 2. Fuite de version serveur ==="
srv=$(curl -sS -m 15 -o /dev/null -D - "https://$H/" | grep -i '^server:' || true)
if printf '%s' "$srv" | grep -qE 'nginx/[0-9]'; then warn "version exposée : ${srv#*: } (server_tokens off non pris sur ce bloc)"
else ok "version non exposée"; fi

echo ""
echo "=== 3. TLS ==="
for v in tls1 tls1_1 tls1_2 tls1_3; do
  if echo | timeout 8 openssl s_client -connect "$H:443" -servername "$H" -"$v" 2>/dev/null | grep -q 'BEGIN CERTIFICATE'; then
    case "$v" in tls1|tls1_1) ko "$v accepté (obsolète)";; *) ok "$v accepté";; esac
  else
    case "$v" in tls1|tls1_1) ok "$v refusé";; *) warn "$v refusé";; esac
  fi
done

echo ""
echo "=== 4. Authentification par mot de passe SSH ==="
out=$(ssh -o BatchMode=no -o PreferredAuthentications=password,keyboard-interactive -o PubkeyAuthentication=no \
      -o StrictHostKeyChecking=accept-new -o ConnectTimeout=8 -o NumberOfPasswordPrompts=0 \
      "root@$H" true 2>&1 | tail -2)
if printf '%s' "$out" | grep -qiE 'Permission denied \(publickey\)|no supported authentication'; then
  ok "mot de passe refusé — seule la clé est acceptée"
  printf '     %s\n' "$out"
elif printf '%s' "$out" | grep -qi 'password'; then
  ko "le serveur propose encore l'authentification par mot de passe"
  printf '     %s\n' "$out"
else
  warn "réponse inattendue : $out"
fi

echo ""
echo "=== 5. Méthodes HTTP ==="
for m in TRACE OPTIONS; do
  c=$(curl -sS -m 10 -o /dev/null -w '%{http_code}' -X "$m" "https://$H/")
  case "$c" in 405|501) ok "$m refusé ($c)";; *) warn "$m renvoie $c";; esac
done

echo ""
echo "=== 6. Redirections et soft-404 ==="
for path in /admin /catalogue /panier; do
  line=$(curl -sS -m 12 -o /dev/null -w '%{http_code} %{num_redirects}' "https://$H$path")
  code=${line%% *}; hops=${line##* }
  if [ "$code" = "200" ] && [ "$hops" = "0" ]; then ok "$path 200 direct"
  elif [ "$code" = "200" ]; then warn "$path 200 après $hops redirection(s)"
  else ko "$path renvoie $code"; fi
done
unknown=$(curl -sS -m 12 -o /dev/null -w '%{http_code}' "https://$H/url-inexistante-verification-$RANDOM")
case "$unknown" in 404) ok "URL inconnue renvoie 404";; 200) ko "soft-404 : une URL inconnue renvoie 200";; *) warn "URL inconnue renvoie $unknown";; esac

echo ""
[ "$rc" -eq 0 ] && echo "RESULTAT : conforme aux attentes de la phase 1" || echo "RESULTAT : durcissement incomplet (voir ❌)"
exit "$rc"
