# DELIKREOL Lite premium - Notes securite

## Secrets et variables
- Ne jamais mettre de secrets dans le frontend.
- Utiliser uniquement des variables d'environnement GitHub/CI pour les `VITE_*`.
- Les valeurs `VITE_*` sont visibles dans le bundle final (build-time).
- `SUPABASE_SERVICE_ROLE_KEY` ne doit jamais etre expose cote client.

## Donnees utilisateur (checkout)
- Les champs sont assainis (trim, limites, suppression de caracteres HTML).
- Les champs requis sont controles avant activation du CTA WhatsApp.
- Le message WhatsApp est construit a partir de donnees nettoyees.

## Hebergement statique
- GitHub Pages = pas de backend, pas de stockage sensible.
- Pas de session serveur persistante.
- Les confirmations et paiements restent manuels.

## A venir
- Backend securise (Supabase/ERP) pour commandes, paiements et suivi
- Tokenisation et validation serveur si activation des paiements
