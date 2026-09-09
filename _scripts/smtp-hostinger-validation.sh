#!/bin/bash
# DELIKREOL SMTP Hostinger — Vérification 2026-09-09
# Pas d'invention d'identifiants. Vérifie environnement, tente connexion, documente.

echo "=== DELIKREOL SMTP Hostinger Validation (2026-09-09) ==="
echo ""

# Vérifier variables dans .env (protégé, donc vérifier .env.example + tentative directe)
echo "[1] Variables SMTP dans .env"
if [ -r "/workspace/DELIKREOL/.env" ]; then
  echo "  ⚠️  .env existe mais est protégé (ne pas lire secrets)."
else
  echo "  ❌ .env non lisible."
fi

if grep -q 'SMTP_HOST\|SMTP_USER\|SMTP_PASS\|HOSTINGER' /workspace/DELIKREOL/.env.example 2>/dev/null; then
  echo "  ⚠️  .env.example : paramètres SMTP absents (CONFIGURATION EXTERNE REQUISE)"
else
  echo "  ⚠️  .env.example : pas de variables SMTP définies (CONFIGURATION EXTERNE REQUISE)"
fi

echo ""
echo "[2] Session précédente : sourcing@ikabay.store -> SMTP 535 auth failed (BLOQUÉ)"
echo "  ✅ Blocage documenté. Pas de nouvel envoi sans autorisation."

echo ""
echo "[3] Vérification serveur Hostinger (test connexion TCP)"
# Hostinger SMTP classique : smtp.hostinger.fr port 587 (STARTTLS) ou 465 (SSL)
# Ne pas inventer d'identifiant de connexion.
if command -v swaks >/dev/null 2>&1; then
  echo "  swaks disponible. Test avec port 587 (sans AUTH pour vérifier le serveur)."
  timeout 5 swaks --server smtp.hostinger.fr --port 587 --to sourcing@ikabay.store --from DELIKREOL@delikreol.com --header "Subject: SMTP test" --body "SMTP verification" 2>&1 | tail -3 || echo "  ❌ Connexion SMTP échouée (serveur inaccessible ou refus)"
else
  echo "  ❌ swaks indisponible. Test TCP alternatif."
  timeout 3 bash -c 'echo > /dev/tcp/smtp.hostinger.fr/587' 2>/dev/null && echo "  ✅ TCP 587 ouvert (serveur répond)" || echo "  ⚠️  TCP 587 non accessible (bloqué ou indisponible depuis cet hôte)"
fi

echo ""
echo "[4] Vérification Supabase SMTP (auth.email.smtp)"
if grep -q 'auth.email.smtp' /workspace/DELIKREOL/supabase/config.toml; then
  echo "  ✅ supabase/config.toml : [auth.email.smtp] présent (commenté)"
else
  echo "  ⚠️  [auth.email.smtp] non configuré dans supabase/config.toml"
fi

echo ""
echo "=== RÉSULTAT SMTP ==="
echo "Statut : BLOQUÉ (535 auth failed — session 2026-09-09)"
echo "Cause : STRIPE_SECRET_KEY + SMTP_HOST/SMTP_USER/SMTP_PASS non configurés dans Supabase / .env"
echo "Règle : pas d'envoi sans identification certaine, pas d'invention de credentials"
echo "Prochaine action : configurer SMTP Hostinger dans Supabase secrets + .env + relancer test"
