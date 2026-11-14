#!/usr/bin/env bash
# DELIKREOL — pré-vol SSH. À exécuter SUR LE VPS, avant d'installer le drop-in.
# Rôle : refuser l'application si une coupure de l'auth par mot de passe
# vous laisserait sans aucun moyen d'entrer. Lecture seule, ne modifie rien.
set -uo pipefail

DROPIN=/etc/ssh/sshd_config.d/99-delikreol-hardening.conf
rc=0
say() { printf '%s\n' "$*"; }

say "=== 1. Utilisateur courant et sudo ==="
say "utilisateur : $(id -un) (uid $(id -u))"
command -v sudo >/dev/null && say "sudo : présent" || say "sudo : ABSENT (root requis pour appliquer)"

say ""
say "=== 2. Clés publiques autorisées ==="
for u in root "$(logname 2>/dev/null || echo nobody)" "${SUDO_USER:-}"; do
  [ -n "$u" ] || continue
  f="/root/.ssh/authorized_keys"
  [ "$u" != root ] && f="$(getent passwd "$u" | cut -d: -f6)/.ssh/authorized_keys"
  if [ -s "$f" ]; then
    say "  $u : $(grep -cE '^(ssh-(rsa|ed25519)|ecdsa-)' "$f" 2>/dev/null) clé(s) dans $f"
  else
    say "  $u : AUCUNE clé dans $f"
  fi
done

say ""
say "=== 3. Dernière connexion par clé (preuve récente) ==="
last -n 5 -i 2>/dev/null | head -5 || say "  historique indisponible"

say ""
say "=== 4. Réglages effectifs actuels ==="
sshd -T 2>/dev/null | grep -iE '^(passwordauthentication|permitrootlogin|pubkeyauthentication|kbdinteractiveauthentication)' || say "  sshd -T indisponible"

say ""
say "=== 5. Port et pare-feu ==="
ss -lntp 2>/dev/null | grep -E ':22\b' || say "  port 22 non vu en écoute"
if command -v ufw >/dev/null; then ufw status 2>/dev/null | head -3; else say "  ufw : non installé"; fi

say ""
say "=== 6. Validation du drop-in s'il est déjà en place ==="
if [ -f "$DROPIN" ]; then
  if sshd -t 2>/tmp/sshd-test.err; then
    say "  sshd -t : OK"
  else
    say "  sshd -t : ÉCHEC"; cat /tmp/sshd-test.err; rc=1
  fi
else
  say "  drop-in absent (rien à valider pour l'instant)"
fi

say ""
say "=== 7. Verdict ==="
if ! grep -qsE '^(ssh-ed25519|ssh-rsa|ecdsa-)' /root/.ssh/authorized_keys 2>/dev/null \
   && ! grep -rqsE '^(ssh-ed25519|ssh-rsa|ecdsa-)' /home/*/.ssh/authorized_keys 2>/dev/null; then
  say "  BLOQUÉ : aucune clé publique trouvée. Ne coupez surtout pas l'auth par mot de passe."
  rc=1
else
  say "  OK : au moins une clé publique est autorisée. Gardez une session ouverte pendant l'application."
fi
exit "$rc"
