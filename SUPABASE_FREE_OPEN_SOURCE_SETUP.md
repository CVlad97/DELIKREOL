# DeliKreol — Supabase Free / Open Source Setup

## Objectif

Dupliquer DeliKreol en mode gratuit, fonctionnel et securise :

- GitHub Pages pour publier gratuitement le frontend.
- Supabase Free pour la base de donnees publique securisee par RLS.
- WhatsApp-first pour les commandes tant que le paiement et l'automatisation ne sont pas valides.
- Aucun secret dans GitHub ou dans le frontend.

## Liens utiles

- Supabase dashboard : https://supabase.com/dashboard
- Creer un projet : https://supabase.com/dashboard/projects
- Recuperer URL + anon key : https://supabase.com/dashboard/project/_/settings/api
- GitHub Pages du projet : https://cvlad97.github.io/DELIKREOL/

## Etapes rapides

1. Creer un nouveau projet Supabase Free.
2. Nom recommande : delikreol-free.
3. Region recommandee : Europe si disponible, sinon region gratuite par defaut.
4. Aller dans Project Settings puis API.
5. Copier uniquement : Project URL et anon public key.
6. Ne jamais copier la service role key dans GitHub ou le frontend.
7. Dans GitHub > repository > Settings > Secrets and variables > Actions > Variables, ajouter :
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_WHATSAPP_NUMBER = 596696653589
8. Lancer le workflow GitHub Pages ou pousser un commit.

## Variables publiques autorisees

```env
VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=ANON_PUBLIC_KEY
VITE_FREE_MODE=true
VITE_ORDER_MODE=whatsapp_first
VITE_WHATSAPP_NUMBER=596696653589
VITE_CONTACT_EMAIL=contact@delikreol.mq
VITE_OPERATIONS_EMAIL=contact@delikreol.mq
```

## Variables interdites cote frontend

Ne jamais mettre dans .env, GitHub public, React ou Vite :

- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY
- META_WHATSAPP_TOKEN
- GITHUB_TOKEN
- mot de passe Hostinger
- mot de passe email

## Mode de fonctionnement recommande

### Phase 1 — Gratuit fonctionnel

- Catalogue statique depuis GitHub.
- Boutons WhatsApp vers +596 696 65 35 89.
- Demandes de devis via WhatsApp/contact.
- Supabase utilise seulement pour leads, demandes partenaires, memoire projet et formulaires simples.

### Phase 2 — Base de donnees active

Tables a creer :

- profiles
- vendors
- products
- orders
- order_items
- drivers
- deliveries
- relay_points
- catering_requests
- partner_applications
- reviews
- leads
- marketing_posts
- financial_assumptions
- operational_alerts
- project_memory

### Phase 3 — Automatisations

A activer seulement apres validation humaine :

- paiement Stripe ou PayPal
- WhatsApp Cloud API
- SMS
- campagnes email
- tableaux financiers automatises

## RLS obligatoire

Toutes les tables publiques doivent avoir RLS activee.

Regles simples de depart :

- lecture publique uniquement pour les contenus marques is_public = true et status = active
- insertion publique limitee pour les formulaires de contact, leads et candidatures
- modification reservee aux utilisateurs authentifies/admin
- aucune donnee personnelle sensible en lecture publique

## Donnees reelles de depart

Partenaires reels a conserver :

- An Tje Coco
- Coco's Food
- Saveurs d'Afrique
- Les Delices de Ninice
- Snack Save Peyia

Points relais :

- Ne pas creer de faux points relais.
- Afficher : Reseau points relais en constitution — candidatures ouvertes.

Livreurs :

- Ne pas creer de faux livreurs.
- Afficher : candidatures livreurs ouvertes.

## Migration principale

Utiliser les migrations du dossier supabase/migrations/.

Migration MemLife deja ajoutee :

- 20260604001500_add_project_memory.sql

## Checklist avant activation Supabase publique

- Projet Supabase actif.
- RLS activee.
- Aucune service role key dans GitHub.
- Variables GitHub Actions configurees.
- GitHub Pages redeploye.
- Formulaires testes.
- Boutons WhatsApp testes.
- Donnees non confirmees marquees a confirmer.
