#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/public/media"
TMP="${TMPDIR:-/tmp}/delikreol-commercial-demo"
mkdir -p "$OUT" "$TMP"
rm -f "$TMP"/slide-*.png "$TMP"/slides.txt

make_slide() {
  local n="$1" tag="$2" title1="$3" title2="$4" line1="$5" line2="$6" auto="$7"
  convert -size 1920x1080 xc:'#fff7ec' \
    -fill '#24150f' -draw 'roundrectangle 75,70 1845,1010 45,45' \
    -fill '#f6c453' -draw 'roundrectangle 120,120 420,195 38,38' \
    -font DejaVu-Sans-Bold -pointsize 34 -fill '#24150f' -annotate +155+170 "$tag" \
    -fill '#cc460f' -draw 'circle 1660,185 1735,185' \
    -font DejaVu-Sans-Bold -pointsize 62 -fill white -gravity northwest -annotate +1634+147 "$n" \
    -font DejaVu-Sans-Bold -pointsize 82 -fill white -gravity northwest -annotate +145+295 "$title1" \
    -font DejaVu-Sans-Bold -pointsize 82 -fill white -gravity northwest -annotate +145+395 "$title2" \
    -font DejaVu-Sans -pointsize 40 -fill '#eadfd8' -gravity northwest -annotate +150+590 "$line1" \
    -font DejaVu-Sans -pointsize 40 -fill '#eadfd8' -gravity northwest -annotate +150+655 "$line2" \
    -fill '#3b2a22' -draw 'roundrectangle 140,770 1780,900 28,28' \
    -font DejaVu-Sans-Bold -pointsize 34 -fill '#f6c453' -gravity northwest -annotate +175+825 'AUTOMATISATION' \
    -font DejaVu-Sans -pointsize 34 -fill white -gravity northwest -annotate +500+825 "$auto" \
    -font DejaVu-Sans-Bold -pointsize 30 -fill '#cc460f' -gravity southwest -annotate +145+65 'DELIKREOL.COM  •  Démonstration pilote sans débit réel' \
    "$TMP/slide-$n.png"
}

make_slide 1 '1 · DÉCOUVERTE' 'Trouver un traiteur' 'près de chez soi' 'Commune, cuisine et disponibilité orientent le client.' 'Même catalogue pour le pilote et le futur lancement public.' 'Catalogue + filtres + géolocalisation consentie'
make_slide 2 '2 · COMPOSITION' 'Composer son plat' 'avant le panier' 'Accompagnements, sauces, boissons et consignes sont conservés.' 'Les choix obligatoires peuvent bloquer le panier si incomplets.' 'Règles menu + validation avant ajout'
make_slide 3 '3 · PRIX SERVEUR' 'Le serveur recalcule' 'le vrai total' 'Le navigateur ne décide ni du prix, ni du vendeur, ni du statut payé.' 'Produits, options et frais sont relus côté backend.' 'Prix serveur + idempotence + tracking token'
make_slide 4 '4 · PAIEMENT' 'Checkout SumUp' 'hébergé et sécurisé' 'La clé SumUp reste côté serveur, jamais dans le navigateur.' 'Cette vidéo simule le paiement : aucun débit réel.' 'Création checkout + retour sécurisé'
make_slide 5 '5 · CONFIRMATION' 'Le webhook vérifie' 'chez SumUp' 'DELIKREOL relit le checkout avant de marquer une commande payée.' 'Montant, devise, référence et état sont contrôlés.' 'Webhook + relecture fournisseur + idempotence'
make_slide 6 '6 · TRAITEUR' 'Le traiteur reçoit' 'et traite la commande' 'Notification, acceptation, préparation puis commande prête.' 'Les statuts sont limités au vendeur propriétaire.' 'Notification automatique • traitement humain métier'
make_slide 7 '7 · REMISE' 'Retrait, relais ou' 'livraison indépendante' 'Le client suit la commande jusqu’à sa remise.' 'Le livreur choisit librement les missions proposées.' 'Proposition + suivi + preuve de remise'
make_slide 8 '8 · ORCHESTRATION' 'n8n supervise' 'les événements sûrs' 'Relances, notifications et support peuvent être automatisés.' 'Paiement, KYC, litige et contrat restent sous validation humaine.' 'n8n + LLM local • actions sensibles = pending_approval'

for i in $(seq 1 8); do
  printf "file '%s/slide-%s.png'\nduration 6\n" "$TMP" "$i" >> "$TMP/slides.txt"
done
printf "file '%s/slide-8.png'\n" "$TMP" >> "$TMP/slides.txt"

ffmpeg -y -loglevel error -f concat -safe 0 -i "$TMP/slides.txt" \
  -vf 'fps=30,format=yuv420p' -c:v libx264 -preset veryfast -crf 23 \
  -movflags +faststart "$OUT/delikreol-presentation-commerciale.mp4"

ffprobe -v error -show_entries format=duration,size -of default=nw=1 \
  "$OUT/delikreol-presentation-commerciale.mp4"
