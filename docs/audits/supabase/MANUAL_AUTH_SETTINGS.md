# MANUAL_AUTH_SETTINGS.md — DELIKREOL Supabase Auth

## Configuration requise (Dashboard Supabase)

Aller dans : **Supabase Dashboard → Authentication → Settings**

### Password Security
| Setting | Valeur recommandée | Statut |
|---|---|---|
| Enable leaked password protection | ✅ ON | ⏳ Manuelle |
| Minimum password length | 8 | ⏳ Manuelle |
| Enable email confirmations | ✅ ON | ⏳ Manuelle |

### Sessions
| Setting | Valeur | 
|---|---|
| Session duration | 3600 (1h) — défaut |
| Refresh token reuse interval | 10s — défaut |

### Redirect URLs
| Setting | Valeur |
|---|---|
| Site URL | `https://delikreol.com` |
| Redirect URLs | `https://delikreol.com/**` |

### Production
- SITE_URL doit pointer vers `https://delikreol.com` (déjà dans le déploiement GitHub Pages)
- Vérifier qu'aucune URL non autorisée n'est listée