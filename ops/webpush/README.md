# DELIKREOL Web Push worker

Worker auto-hébergé sur le VPS. Il consomme la file partenaire via `vendor-push-gateway` et envoie des notifications Web Push aux PWA traiteurs.

Secrets requis sur le VPS uniquement :
- `/opt/delikreol-whatsapp/secrets/worker-key`
- `/opt/delikreol-webpush-worker/vapid.json`

Ne jamais committer la clé VAPID privée ni la clé worker.
