# DELIKREOL — Plan de finalisation

## 1. Supabase

### Variables nécessaires (ne pas commit)
```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>  # jamais côté frontend
```

### Migrations prêtes
- `supabase/migrations/20260609000001_delikreol_schema.sql` → 14 tables
- `supabase/migrations/20260609000002_rls_policies.sql` → RLS complètes
- `supabase/seed.sql` → 34 communes, delivery rules, settings

### Déploiement
```bash
npx supabase link --project-ref <project-id>
npx supabase db push
npx supabase db seed
```

---

## 2. Stripe — Mode Test

### Statut : 🔒 DÉSACTIVÉ sur le site
- Le site reste **WhatsApp-first** (pas de paiement en ligne)
- Stripe **uniquement en mode test** pour validation backend

### Configuration
1. Créer compte Stripe → https://dashboard.stripe.com/register
2. Récupérer :
   - `STRIPE_SECRET_KEY` (sk_test_...) → env serveur
   - `VITE_STRIPE_PUBLISHABLE_KEY` (pk_test_...) → frontend uniquement
3. Webhooks à créer :
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

### À faire avant activation
- [ ] Compte Stripe créé
- [ ] Webhook endpoint prêt
- [ ] Edge Function ou backend dédié
- [ ] Validation humaine : « Paiement en ligne prévu en phase 2 »

---

## 3. Domaine delikreol.mq

### DNS Checklist
| Type | Nom | Valeur |
|------|-----|--------|
| CNAME | `@` | `cvlad97.github.io` (si GitHub Pages) |
| CNAME | `www` | `cvlad97.github.io` |
| MX | `@` | Google Workspace MX (si email) |
| TXT | `@` | `v=spf1 include:_spf.google.com ~all` |
| TXT | `google._domainkey` | DKIM key (générer dans Google Admin) |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:contact@delikreol.mq` |

### Emails
| Adresse | Usage |
|---------|-------|
| `contact@delikreol.mq` | Public / clients |
| `commandes@delikreol.mq` | Commandes WhatsApp |
| `partenaires@delikreol.mq` | Prospection partenaires |

### Hébergement conseillé
- **Phase 1** : GitHub Pages + custom domain (gratuit, HTTPS automatique)
- **Phase 2** : Netlify (SPA fallback natif, _redirects, analytics)
- **Phase 3** : VPS si backend Stripe/Supabase lourd

---

## 4. WhatsApp Business

### Messages templates (préparés)
| Type | Message |
|------|---------|
| Accueil | « Bonjour ! 👋 Bienvenue sur DeliKreol — commandez vos plats locaux en Martinique. Envoyez votre demande, on vous répond vite. » |
| Absence | « Merci pour votre message. Nous revenons vers vous dès que possible. ⌛ » |
| Commande | « Merci pour votre commande ! Nous la confirmons avec le traiteur et revenons vers vous rapidement. 📦 » |
| Devis | « Votre demande de devis a bien été reçue. Nous l'étudions et vous contactons sous 24h. 📋 » |
| Partenaire | « Merci de votre intérêt pour devenir partenaire DeliKreol ! Notre équipe vous recontacte pour les prochaines étapes. 🤝 » |

---

## 5. Projets clones dans /workspace

| Projet | Status | Build |
|--------|--------|-------|
| DELIKREOL | ✅ Actif | ✅ 5.1s |
| Kaygo | ✅ Cloné + pnpm installé | ✅ 4.9s |
| anbaybot | ✅ Cloné + npm installé | ✅ 1.3s |
| IKABAY | ✅ Cloné + npm installé | ✅ 0.9s |
| Irchestrator | ✅ Cloné + npm installé | ✅ tsc |
| tiflow-pro | ⬜ Pas de package.json | — |

---

## 6. Prochaines actions recommandées

1. **GO SUPABASE** → `npx supabase link` + `db push` (quand le projet Supabase est créé)
2. **GO DOMAINE MQ** → Configurer DNS chez Hostinger/registrar
3. **GO STRIPE TEST** → Créer compte Stripe, webhooks
4. **GO CAMPAGNE** → Lancement WhatsApp / Instagram
5. **GO ANDROID** → Connecter ADB ou Drive pour imports photos