#!/usr/bin/env bash
# BOT DE NETTOYAGE AUTONOME DELIKREOL — 2026-09-08
# Cibles AUTORISÉES SEULEMENT. Aucune suppression de données projet.
# Activé UNIQUEMENT si / atteint >= 90 %
# Verrou : /tmp/delikreol_clean.lock (empêche simultanéité)
# Journal : /tmp/delikreol_clean.log (rotation courte : max 5 lignes conservées)
# Arrêt immédiat si une cible protégée détectée.

LOCKFILE="/tmp/delikreol_clean.lock"
LOGFILE="/tmp/delikreol_clean.log"
DISK_BEFORE=""
DISK_AFTER=""

# Interdictions absolues (vérification avant chaque suppression)
PROHIBITED_TARGETS=(".git" "/workspace/DELIKREOL/" "/workspace/_docs/" "/workspace/_data/" "/workspace/_media/" "/workspace/_scripts/" "/home/hermeswebui/.hermes/" "/workspace/DELIKREOL/node_modules/" "/workspace/DELIKREOL/supabase/" "/workspace/DELIKREOL/src/" "/workspace/DELIKREOL/public/" "docker" "system" "prune" "--volumes")

# Autorisés uniquement
ALLOWED_TARGETS=(
  "/tmp/npm/_cacache"
  "/tmp/tiflow-src"
  "/tmp/whatsapp-bridge"
  "/tmp/node-compile-cache"
)

log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $1" >> "$LOGFILE"
  # Rotation courte : garder max 5 lignes
  local lines
  lines=$(wc -l < "$LOGFILE")
  if [ "$lines" -gt 5 ]; then
    tail -n 5 "$LOGFILE" > "${LOGFILE}.tmp"
    mv "${LOGFILE}.tmp" "$LOGFILE"
  fi
}

# Vérifier disque
check_disk() {
  local usage
  usage=$(df -h / | tail -1 | awk '{print $5}' | tr -d '%')
  echo "$usage"
}

# Vérifier si une cible est protégée
is_protected() {
  local target="$1"
  for p in "${PROHIBITED_TARGETS[@]}"; do
    case "$target" in
      *"$p"*) return 0 ;; # protégée détectée
    esac
  done
  return 1
}

main() {
  # Verrou simultanéité
  if [ -f "$LOCKFILE" ]; then
    echo "LOCK EXISTANT — sortie immédiate (pas d'exécution simultanée)"
    exit 0
  fi
  touch "$LOCKFILE"
  trap 'rm -f "$LOCKFILE"' EXIT

  local disk_usage
  disk_usage=$(check_disk)
  echo "DISQUE AVANT: ${disk_usage}%"
  echo "DISQUE AVANT: ${disk_usage}%" >> "$LOGFILE"

  if [ "$disk_usage" -lt 90 ]; then
    echo "DISQUE < 90% (${disk_usage}%). Nettoyage NON LANCÉ."
    log "STOP — disque ${disk_usage}% < 90%"
    exit 0
  fi

  # Vérifier autorisation des cibles (pas de volume Docker, pas .git, pas projets)
  for t in "${ALLOWED_TARGETS[@]}"; do
    if [ -e "$t" ]; then
      if is_protected "$t"; then
        echo "CIBLE PROTÉGÉE DÉTECTÉE ($t) — ARRÊT IMMÉDIAT"
        log "ARRÊT — cible protégée: $t"
        exit 1
      fi
      # Nettoyage autorisé : uniquement caches spécifiques
      rm -rf "$t"
      echo "SUPPRIMÉ (autorisé): $t"
      log "SUPPRIMÉ (autorisé): $t"
    else
      echo "ABSENT (pas d'action): $t"
    fi
  done

  # Vérifier Docker build cache inutilisé SANS volumes (pas de system prune --volumes)
  # On vérifie uniquement avec docker images/buildx, sans supprimer de volumes
  # Ici on n'exécute pas docker system prune --volumes (interdiction absolue)
  # Juste noter si Docker existe et s'il y a un cache inutilisé
  if command -v docker >/dev/null 2>&1; then
    # Ne pas exécuter docker system prune --volumes
    # Juste noter la présence, sans suppression
    echo "DOCKER PRÉSENT — AUCUNE SUPPRESSION EFFECTUÉE (interdiction volumes)"
    log "DOCKER PRÉSENT — pas de suppression (interdiction volumes)"
  else
    echo "DOCKER ABSENT"
  fi

  local disk_after
  disk_after=$(check_disk)
  echo "DISQUE APRÈS: ${disk_after}%"
  echo "DISQUE APRÈS: ${disk_after}%" >> "$LOGFILE"
  echo "ESPACE LIBÉRÉ (approx): calcul non mesuré directement (seulement caches spécifiques supprimés)"
  log "FIN — disque après: ${disk_after}%"
}

main "$@"
