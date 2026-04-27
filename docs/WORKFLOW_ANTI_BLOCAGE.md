# Workflow anti-blocage DELIKREOL

## Objectif
Eviter les ecarts entre le local, GitHub, GitHub Pages et le socle Supabase reel.

## Regle
Une version n'est pas consideree prete tant que :
- le code n'est pas dans GitHub
- le deploiement public n'est pas accessible
- les variables GitHub Actions ne sont pas posees
- le front public ne lit pas le vrai socle Supabase attendu

## Methode recommandee
1. Modifier localement.
2. Verifier `npm run build`.
3. Verifier localement les lectures et ecritures minimales contre Supabase.
4. Pousser sur GitHub.
5. Verifier ou relancer GitHub Actions.
6. Verifier GitHub Pages.
7. Verifier que la prod n'est plus en mode demo.

## Check de publication
- build local OK
- variables GitHub Actions OK
- `vendors` OK
- `products` OK
- `orders` OK
- `order_items` OK
- `business_requests` OK
- contenu public = flux reel attendu

## Si le push ou le deploiement bloque
- utiliser le connecteur GitHub pour les fichiers texte et workflows si possible
- signaler explicitement la divergence local / GitHub / public
- ne pas continuer une passe fonctionnelle lourde tant que la source de verite n'est pas clarifiee

## Regle d'exploitation
Pas de validation finale tant que l'URL publique n'utilise pas le vrai socle de donnees.

## Lien public de reference
https://cvlad97.github.io/DELIKREOL/
