---
name: delikreol-vps-infra
description: Audite et maintient l'infrastructure du VPS Hostinger de DeliKreol (nginx, docroot réel, conteneurs Docker, disque, certificats, pare-feu) sans jamais toucher à la production sans autorisation. Utiliser pour un audit serveur, un disque plein, un conteneur arrêté, un certificat qui expire ou un doute sur le répertoire réellement servi.
---

# DeliKreol — infra VPS

Serveur : `srv1729857.hstgr.cloud` = `2.24.15.8` (IPv6 `2a02:4780:7:4639::1`). C'est aussi l'IP de `delikreol.com`. nginx 1.24.0 Ubuntu, conteneur applicatif `delikreol-web`.

## Regardes d'abord, écris ensuite

Toujours en lecture seule avant toute action. Bloc de référence :

```bash
df -h / ; df -i /
docker ps -a --format '{{.Names}}\t{{.Status}}\t{{.Ports}}'
nginx -T 2>/dev/null | grep -E 'server_name|root |proxy_pass' | head -40
ls -la /opt/delikreol-runtime/ ; ls -la /opt/delikreol-runtime/releases/ 2>/dev/null | tail -5
certbot certificates 2>/dev/null | grep -E 'Certificate Name|Domains|Expiry'
ss -lntp | head -30
systemctl list-timers | grep -E 'certbot|apt'
ps -eo stat,ppid,pid,comm | awk '$1 ~ /Z/'
```

## Piège n°1 : le docroot documenté est faux

`/opt/delikreol-runtime/site` contient un `release.json` en `c38b5ae` du 06/10/2026 alors que le site sert `delikreol-84c0d40` du 06/11/2026 : c'est une copie morte. **Confirmer le `root` nginx avant toute conclusion ou tout déploiement.** Un déploiement dans `site/` n'aurait aucun effet visible.

## Piège n°2 : les ports en double

Plusieurs conteneurs publient les mêmes ports (`8787`, `9119` chez Hermes ; `63970` chez `openclaw-6n0r-openclaw-1` et `ikabay-dropshipping-api`). Un seul détient le port. Vérifier par `docker port <nom>` et `ss -lntp | grep <port>` : « Up » ne signifie pas joignable.

## Règles de maintenance

- **Jamais** `docker system prune -a --volumes` ni `docker volume prune` : le volume PostgreSQL de `listmonk_db` et les états Hermes seraient détruits.
- Ordre de récupération d'espace, par ratio gain/risque : journal + apt + builder prune → images non utilisées → logs de conteneurs volumineux (`truncate`, instantané) → modèles Ollama (blobs partagés, gain réel inférieur à la somme) → doublons Hermes (arbitrage humain).
- `daemon.json` avec `max-size: 10m`, `max-file: 3` se pose **dans la fenêtre de reboot**, pour ne pas redémarrer Docker deux fois.
- Seuil projet : disque > 10 % libres, sinon FAIL. 85 % d'occupation = cible de sortie de crise.
- Certificats : échéance `16/01/2027` pour `delikreol.com` et `srv1729857.hstgr.cloud`. Vérifier le timer certbot, pas seulement la date.
- Le bridge WhatsApp (`delikreol-whatsapp`) **n'est pas dans `docker ps`** : le considérer indisponible jusqu'à preuve du contraire, et ne jamais désactiver la vérification de signature pour le faire « marcher ».

## Rapport

Pour chaque ressource : valeur mesurée, seuil, PASS/FAIL, et l'action proposée avec son risque. Aucun secret, aucune clé, aucun `.env` affiché. Toute action destructive attend une autorisation explicite et une sauvegarde datée.
