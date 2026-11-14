# DELIKREOL — durcissement nginx et SSH

Fichiers prêts à appliquer sur le VPS `srv1729857.hstgr.cloud` (`2.24.15.8`), qui sert aussi `delikreol.com`.

| Fichier | Rôle |
|---|---|
| `nginx-security.conf` | En-têtes de sécurité + `server_tokens off` + CSP en report-only |
| `sshd-99-delikreol.conf` | Drop-in SSH : clé uniquement, root sans mot de passe |
| `preflight-ssh.sh` | **Anti-verrouillage** : refuse l'application si aucune clé n'est autorisée |
| `apply.sh` | Applique avec sauvegarde datée, `nginx -t` / `sshd -t` avant rechargement |
| `verify.sh` | Vérifie depuis l'extérieur (en-têtes, TLS, mot de passe SSH, méthodes HTTP) |

## État mesuré avant application (14/11/2026)

`bash verify.sh delikreol.com` :

- **tous** les en-têtes de sécurité absents sur `/`, `/admin/`, `/catalogue/` ;
- version nginx exposée (`nginx/1.24.0 (Ubuntu)`) ;
- **authentification par mot de passe SSH encore proposée** (`Permission denied (publickey,password)`) ;
- TLS 1.2/1.3 uniquement, TLS 1.0/1.1 refusés ✅ ;
- `TRACE` et `OPTIONS` en 405 ✅.

## Ordre d'application

### 1. SSH d'abord, depuis une session ouverte

```bash
# sur le VPS
sudo bash ops/hardening/preflight-ssh.sh      # doit finir sur "OK"
sudo bash ops/hardening/apply.sh ssh
```

**Ne fermez pas la session courante.** Ouvrez un second terminal et testez :

```bash
ssh -o PreferredAuthentications=publickey root@srv1729857.hstgr.cloud 'echo cle-ok'
```

Si la connexion par clé ne fonctionne pas, restaurez immédiatement :

```bash
rm -f /etc/ssh/sshd_config.d/99-delikreol-hardening.conf
sshd -t && systemctl reload ssh
```

Si vous êtes déjà déconnecté : console VNC/Web Hostinger, puis la même commande. **C'est la seule raison pour laquelle ce fichier ne doit jamais être appliqué sans console de secours disponible.**

### 2. nginx ensuite

```bash
sudo bash ops/hardening/apply.sh nginx
```

Le script installe le snippet mais **ne devine pas** où poser l'include. Il vous indique les fichiers qui définissent déjà `add_header`.

### 3. Le piège `add_header` (à lire avant de croire que c'est fait)

Sous nginx, `add_header` **n'est pas hérité** dès qu'un bloc enfant en définit un. Or le `nginx.conf` du projet pose des `add_header` dans :

- `location = /sw.js`
- `location = /index.html`
- `location ~* \.(css|png|jpg|...)$`
- `location ~* \.js$`
- `location /`

Conséquence : un `include` placé uniquement au niveau `server` serait **ignoré sur ces cinq blocs** — c'est-à-dire précisément sur la page d'accueil et le service worker. D'où la règle :

```nginx
server {
    # ...
    include /etc/nginx/snippets/delikreol-security.conf;   # ne suffit pas seul

    location / {
        include /etc/nginx/snippets/delikreol-security.conf;  # ← indispensable ici
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate" always;
    }
    # idem dans chaque bloc qui contient un add_header
}
```

`apply.sh` s'arrête à `nginx -t` : si l'include est mal placé ou dupliqué, rien n'est rechargé.

### 4. Vérifier depuis l'extérieur

```bash
bash ops/hardening/verify.sh delikreol.com
```

Attendu après application : en-têtes présents sur `/`, `/admin/`, `/catalogue/`, version masquée, mot de passe SSH refusé (`Permission denied (publickey)` seul), CSP annoncée en *report-only*.

## CSP : trois phases

| Phase | Réglage | Critère de passage |
|---|---|---|
| 1 | `Content-Security-Policy-Report-Only` | 7 jours de console sans violation bloquante |
| 2 | `Content-Security-Policy` avec `unsafe-inline` conservé | aucun écran blanc sur les parcours catalogue → panier → admin |
| 3 | suppression de `unsafe-inline` via nonces ou hash au build | nécessite une modification du build Vite, donc un test complet |

Ne sautez pas la phase 1 : la CSP est le seul en-tête qui peut casser l'application, et Leaflet comme les styles inline de React produisent des violations légitimes.

## Hors périmètre de ces fichiers (à faire ensuite)

- **fail2ban** : `jail sshd` avec `maxretry 3`, `bantime 1h` — complète le durcissement SSH contre le bruteforce.
- **Pare-feu** : n'exposer que 22/80/443 ; les ports applicatifs (`63970`, `8787`, `9119`, `11434`) doivent rester sur `127.0.0.1`.
- **`sshd` : `AllowUsers`** — non défini ici faute d'inventaire des comptes réellement utilisés ; à ajouter après `grep -E '^[a-z].*:/bin/(ba)?sh$' /etc/passwd`.

## Limites de validation

- Les scripts passent `bash -n`. `shellcheck` n'est pas installé dans l'environnement de préparation : **aucun contrôle de shellcheck n'a été exécuté**.
- `nginx -t` **n'a pas pu être exécuté** ici (nginx absent, pas de root) : la validation réelle se fait sur le VPS, et `apply.sh` refuse de recharger si elle échoue.
- Le drop-in SSH a été validé syntaxiquement avec le binaire `sshd` présent dans l'environnement de préparation, pas sur le serveur cible.
