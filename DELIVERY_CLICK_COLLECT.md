=== DELIKREOL — LIVRAISON / CLICK & COLLECT ===
Status: À CONSTRUIRE (F — tout le lot)
Source: DELIKREOL/supabase/functions/checkout-order/index.ts (existant)
Canaux notification : WhatsApp (bridge PID 100819, en attente QR), Telegram (@Openopsvcsbot, op.
Email : BLOQUÉ (SMTP 535 auth failed — souring@ikabay.store)
Partenaires : Sweet Family (menu), an-tje-coco, chef-a-mada, coco-food, goute-mwen, ninice, save-peyia, saveurs-afrique (messages dans DELIKREOL/partner_messages/)

Flux livraison / click & collect :
1. Client commande → checkout-order → Stripe (create-payment-intent / stripe-connect-onboard si vendor)
2. Traiteur notifié (WhatsApp si QR scanné, sinon Telegram) → confirmation dispo
3. Disponibilité : livraison (zone) / click & collect (localisation fixe, ex : Martinique / Antilles)
4. Non vendu / DLC : réduction prix / association / don → module à construire

Vérification physique requise avant activation : Stripe Sandbox (pas live), WhatsApp registered=true.
Aucun envoi partenaire sans autorisation explicite (Vladimir).
=== FIN ===
