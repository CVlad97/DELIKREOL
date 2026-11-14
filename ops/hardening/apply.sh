#!/usr/bin/env bash
# DELIKREOL — application du durcissement nginx + SSH.
# À exécuter SUR LE VPS (root). Idempotent, sauvegarde datée avant chaque écriture,
# valide les configurations avant tout rechargement, n'essaie jamais de "rattraper"
# une erreur en forçant.
#
#   sudo bash apply.sh nginx     # en-têtes de sécurité uniquement
#   sudo bash apply.sh ssh       # SSH clé uniquement
#   sudo bash apply.sh all       # les deux (nginx d'abord)
set -euo pipefail

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP="/root/delikreol-hardening-backup-$STAMP"
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="${1:-all}"

log() { printf '[%s] %s\n' "$(date -u +%H:%M:%S)" "$*"; }
die() { printf 'ERREUR: %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "root requis"
mkdir -p "$BACKUP"

apply_nginx() {
  log "nginx : sauvegarde dans $BACKUP"
  local conf=/etc/nginx/nginx.conf
  [ -f "$conf" ] || die "nginx.conf introuvable"
  cp -a "$conf" "$BACKUP/nginx.conf"
  if [ -d /etc/nginx/conf.d ]; then cp -a /etc/nginx/conf.d "$BACKUP/conf.d"; fi
  if [ -d /etc/nginx/sites-enabled ]; then cp -a /etc/nginx/sites-enabled "$BACKUP/sites-enabled"; fi

  install -d -m755 /etc/nginx/snippets
  install -m644 "$SRC/nginx-security.conf" /etc/nginx/snippets/delikreol-security.conf
  log "snippet installé : /etc/nginx/snippets/delikreol-security.conf"

  # Détection du piège d'héritage : on signale les blocs qui posent déjà add_header.
  local sites
  sites=$(grep -rlE '^\s*add_header' /etc/nginx/sites-enabled /etc/nginx/conf.d 2>/dev/null || true)
  if [ -n "$sites" ]; then
    log "ATTENTION : ces fichiers définissent déjà add_header — l'include doit être posé DANS chaque bloc concerné :"
    printf '    %s\n' $sites
  fi

  if ! grep -rqs 'delikreol-security.conf' /etc/nginx/sites-enabled /etc/nginx/conf.d 2>/dev/null; then
    log "Rappel : l'include n'est pas encore posé. Ajoutez cette ligne dans le bloc 443 de delikreol.com :"
    log "    include /etc/nginx/snippets/delikreol-security.conf;"
  fi

  log "nginx -t"
  nginx -t || { log "configuration refusée — restauration"; cp -a "$BACKUP/nginx.conf" "$conf"; exit 1; }
  systemctl reload nginx
  log "nginx rechargé"
}

apply_ssh() {
  log "SSH : pré-vol"
  bash "$SRC/preflight-ssh.sh" || die "pré-vol en échec — aucune modification SSH effectuée"

  install -d -m755 /etc/ssh/sshd_config.d
  [ -f /etc/ssh/sshd_config.d/99-delikreol-hardening.conf ] \
    && cp -a /etc/ssh/sshd_config.d/99-delikreol-hardening.conf "$BACKUP/sshd-99-precedent.conf"
  install -m600 "$SRC/sshd-99-delikreol.conf" /etc/ssh/sshd_config.d/99-delikreol-hardening.conf

  log "sshd -t"
  sshd -t || { log "configuration refusée — retrait du drop-in"; rm -f /etc/ssh/sshd_config.d/99-delikreol-hardening.conf; exit 1; }

  log "réglages effectifs après application :"
  sshd -T | grep -iE '^(passwordauthentication|permitrootlogin|authenticationmethods)' || true

  # rechargement (pas restart) : les sessions ouvertes survivent.
  systemctl reload ssh 2>/dev/null || systemctl reload sshd
  log "SSH rechargé — NE FERMEZ PAS cette session avant d'avoir testé une nouvelle connexion par clé."
}

case "$TARGET" in
  nginx) apply_nginx ;;
  ssh)   apply_ssh ;;
  all)   apply_nginx; apply_ssh ;;
  *)     die "usage: apply.sh [nginx|ssh|all]" ;;
esac

log "sauvegardes : $BACKUP"
log "rollback manuel : restaurer les fichiers depuis $BACKUP, puis nginx -t && systemctl reload nginx"
log "rollback SSH : rm -f /etc/ssh/sshd_config.d/99-delikreol-hardening.conf && sshd -t && systemctl reload ssh"
