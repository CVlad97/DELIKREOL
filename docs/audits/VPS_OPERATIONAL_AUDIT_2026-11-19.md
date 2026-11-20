# Audit opérationnel — 19 novembre 2026

## Décision
GO commercial global non démontré. Le nettoyage et les contrôles techniques ci-dessous sont effectués ; ils ne constituent pas une certification de paiement, de livraison ou de conformité des partenaires.

## VPS : actions et mesures
- Départ : volume racine 96 Gio, 98 % utilisés, environ 2,6 Gio libres.
- Après nettoyage et restauration de l'accès distant : 91 % utilisés, environ 9,2 Gio libres (mesures df arrondies, activité du serveur en cours).
- Gain net observé : environ 6,6 Gio. L'objectif historique de 70 % n'est pas atteint.
- Suppression des dépendances GPU orphelines du profil Vladimir (pas de PyTorch installé dans ce profil).
- Remplacement de PyTorch CUDA 2.12.0 par PyTorch CPU 2.12.0+cpu dans l'environnement Python utilisateur Hermes ; calcul tensoriel et import Whisper validés après installation. Aucun test vocal WebUI n'a été effectué.
- Conservation de Triton dans l'environnement principal car Whisper le déclare comme dépendance.
- Suppression des caches de téléchargement npm/Node et des node_modules de quatre copies de travail inactives : DELIKREOL, IKABAY, kopeagri-caraibes et Kaygo. Sources et fichiers de verrouillage conservés ; réinstallation nécessaire pour reconstruire ces copies. Les dépendances des dépôts opérationnels /opt/vlad/projects sont conservées.
- Aucun effacement de base, session, pièce jointe, sauvegarde métier ou modèle Ollama.
- Le nettoyage npm a touché le répertoire d'installation de Desktop Commander. L'installation 0.3.3 a été restaurée et le service redémarré ; une nouvelle commande distante et systemctl is-active ont confirmé la reprise.
- Tous les 17 conteneurs précédemment démarrés restent démarrés. Les états healthy existants restent présents. Cela ne valide pas toutes leurs fonctions métier.
- nginx -t : réussi ; service Nginx actif ; site DELIKREOL HTTP 200 après intervention.
- Priorité CPU du processus Ollama llama-server inspecté abaissée temporairement de nice 0 à 10 pour privilégier les autres tâches du VPS.

## DELIKREOL : code et déploiement
- Source inspectée : main 63d67f0 ; version frontend publique annoncée : 835badf. Le delta inclut la fonction SumUp et un test, pas un nouveau frontend métier.
- Correctif create-sumup-checkout déployé en version 13 : return_url cible le webhook et redirect_url le suivi client.
- Code déployé relu et comparé exactement au code testé ; requête invalide refusée avec HTTP 400.
- Tests locaux : 102 tests unitaires réussis, typecheck, lint, compilation, audit des secrets réussis.
- Nouveau test exécutable SumUp : callback, retour client, montant serveur, rejet de jeton incorrect, origine interdite et identifiant invalide. Fournisseurs simulés ; aucun débit réel.
- PR #106, commit 813204e : vérifications GitHub Qualité réussies, 104 tests Playwright réussis et 12 contrôles de production réussis.
- Le contrôle externe Workers Builds: delikreol reste en échec. Cause non déterminée ; ne pas présenter tous les contrôles comme verts.

## Vue client et accès partenaire
- Tests publics DELIKREOL : accueil vers catalogue, ajout panier, recherche/filtres, mentions légales, remise en haut lors de navigation, redirection des visiteurs non connectés hors admin et espace partenaire.
- Le premier test panier a dépassé 30 secondes sur le VPS chargé ; le nouveau passage a réussi. La lenteur initiale est conservée comme limite de mesure.
- Contrôles à 390 et 1440 pixels sur accueil, catalogue, pro, connexion et entrée partenaire : aucun débordement horizontal, aucune image cassée observée, aucune exception JavaScript capturée.
- La vue partenaire authentifiée avec un vrai compte et les actions sur une vraie commande ne sont pas validées par ces seuls contrôles publics.
- IKABAY : accueil https://ikabay.store/ HTTP 200, rendu mobile sans image cassée ni débordement observé.
- ANBAYBOT : accueil https://cvlad97.github.io/anbaybot/ HTTP 200, rendu mobile sans image cassée ni débordement observé. Cela ne valide pas une opération financière.
- KOPÉAGRI : accueil https://cvlad97.github.io/kopeagri-caraibes/ HTTP 200 ; ancienne URL /KopeAgri_Caraibes reproduite en 404. Correctif de redirection préparé séparément.

## Base et contrôles d'accès
- RLS activée sur orders, order_items, profiles et vendors.
- Lectures anonymes réelles : orders HTTP 401, profiles HTTP 401, order_items HTTP 404 ; aucune ligne exposée dans ces requêtes.
- Les quatre fonctions SECURITY DEFINER signalées par l'auditeur ont été relues : elles contiennent des contrôles d'identité, rôle ou propriété. Leur présence dans l'auditeur n'est pas à elle seule une preuve de vulnérabilité ; tous les scénarios authentifiés n'ont pas été exécutés.
- Protection des mots de passe compromis désactivée : point de durcissement non corrigé dans cette intervention.
- 8 vendeurs sont marqués verified et actifs en base ; ce statut ne prouve pas leur disponibilité réelle ni leur conformité documentaire.

## Autres dépôts : portée limitée
- KOPÉAGRI : tests locaux et typecheck réussis ; lint sans erreur mais 89 avertissements sur la copie inspectée.
- ANBAYBOT : 24 tests réussis, typecheck et lint réussis sur la copie inspectée.
- IKABAY : 5 tests du pont API réussis sur la copie inspectée.
- Ces résultats ne valident pas leurs parcours commerciaux de bout en bout ni l'alignement de toutes les copies avec la production.

## Conditions restantes avant GO
1. Valider les comptes client/partenaire réels, l'acceptation/refus et la propriété des commandes.
2. Démontrer un paiement sandbox, sa notification serveur, son idempotence, une annulation et un remboursement ; aucun paiement confirmé ni remboursement trouvé parmi l'unique commande inspectée.
3. Exécuter et tracer les 20 commandes pilotes prévues (retrait/livraison et cas d'échec compris).
4. Faire confirmer par les partenaires les informations commerciales et alimentaires : l'audit statique des 12 fiches relève 9 allergènes à confirmer et 12 validations photo/description manquantes. Ne pas extrapoler ces nombres au catalogue hybride public de 58 références.
5. Résoudre le contrôle Cloudflare en échec et conserver un retour arrière vérifié pour les prochains déploiements.
6. Améliorer encore la marge disque : 91 % reste élevé ; la suppression de services, images utilisées, historiques ou modèles utiles n'a pas été entreprise.

## Sources
- Preuves directes : commandes VPS, résultats GitHub Actions de la PR https://github.com/CVlad97/DELIKREOL/pull/106, fonctions et requêtes Supabase, navigation Playwright du 19 novembre 2026.
- Docker : https://docs.docker.com/engine/manage-resources/pruning/
- PyTorch CPU : https://docs.pytorch.org/get-started/ et https://pytorch.org/get-started/previous-versions/
- SumUp : https://developer.sumup.com/api/checkouts/create/ et https://developer.sumup.com/online-payments/webhooks/
- Protection des mots de passe : https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
