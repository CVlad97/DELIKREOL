#!/usr/bin/env bash
# DELIKREOL — pare-feu ufw, à exécuter SUR LE VPS (root).
#
#   sudo bash ufw-delikreol.sh           # applique (interactif désactivé)
#   sudo bash ufw-delikreol.sh --check   # affiche seulement l'état
#
# Anti-verrouillage : refuse d'activer ufw si la règle SSH n'est pas en place.
#
# ⚠️ DOCKER : les conteneurs qui publient un port (`-p 0.0.0.0:63970->...`) court-circuitent
# ufw, car Docker écrit directement dans les chaînes iptables/nftables. Une règle ufw
# ne bloque donc PAS un port publié par un conteneur. La parade est la chaîne DOCKER-USER.
set -euo pipefail

check_only=0
[ "${1:-}" = "--check" ] && check_only=1

log() { printf '[%s] %s\n' "$(date -u +%H:%M:%S)" "$*"; }
die() { printf 'ERREUR: %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "root requis"
command -v ufw >/dev/null || die "ufw non installé : apt-get install -y ufw"

if [ "$check_only" -eq 1 ]; then
  log "état ufw"; ufw status verbose || true
  log "ports en écoute non locaux (à comparer aux règles)"; ss -lntp | awk 'NR==1 || $4 !~ /^(127\.0\.0\.1|\[::1\])/'
  log "chaîne DOCKER-USER"; iptables -S DOCKER-USER 2>/dev/null || echo "  absente"
  exit 0
fi

log "politiques par défaut"
ufw default deny incoming
ufw default allow outgoing

log "règles de service"
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP -> HTTPS'
ufw allow 443/tcp comment 'HTTPS'

# Anti-verrouillage : la règle SSH doit exister AVANT l'activation.
if ! ufw show added | grep -qE '(^| )22/tcp'; then
  die "règle 22/tcp absente de ufw — activation annulée pour éviter de vous couper"
fi

log "blocage des ports applicatifs sur l'interface publique"
# Ces services doivent rester en 127.0.0.1 ; on refuse explicitement leur exposition.
for p in 3000 3001 5678 63970 8787 9119 11434 8642; do
  ufw deny "$p"/tcp comment "non public ($p)" || true
done

log "activation"
ufw --force enable
ufw status verbose

log "Docker : blocage des ports publiés en dehors de 80/443"
if iptables -L DOCKER-USER >/dev/null 2>&1; then
  # Autorise le trafic établi et les ports web, refuse le reste vers les conteneurs.
  if ! iptables -C DOCKER-USER -i eth0 -p tcp --dport 63970 -j DROP 2>/dev/null; then
    for p in 3000 3001 5678 63970 8787 9119 11434 8642; do
      iptables -I DOCKER-USER -i eth0 -p tcp --dport "$p" -j DROP || true
    done
    log "règles DOCKER-USER posées (non persistantes sans iptables-persistent)"
    log "pour les rendre durables : apt-get install -y iptables-persistent && netfilter-persistent save"
  else
    log "règles DOCKER-USER déjà présentes"
  fi
else
  log "chaîne DOCKER-USER absente (Docker non installé ?) — rien à faire"
fi

log "vérification finale"
ufw status numbered | head -20
log "⚠️  testez immédiatement une nouvelle connexion SSH avant de fermer cette session."
