import { useEffect } from 'react';
import { DollarSign, MessageCircle } from 'lucide-react';

const WHATSAPP = '596696653589';

const offres = [
  { name: 'Commande repas DeliKreol', cible: 'Particuliers, familles', promesse: 'Commander un repas local en 2 minutes', prix: 'Commission sur commande confirmee', status: 'Actif', priorite: 'P1' },
  { name: 'Devis traiteur evenementiel', cible: 'Particuliers, entreprises', promesse: 'Devis personnalise sous 24h', prix: 'Commission sur devis accepte', status: 'Actif', priorite: 'P1' },
  { name: 'Repas entreprise', cible: 'Entreprises, CE, associations', promesse: 'Repas groupe cle en main', prix: 'Sur devis, cible 12-25 EUR/personne', status: 'A vendre', priorite: 'P0' },
  { name: 'Configuration WhatsApp Business', cible: 'Traiteurs, restaurateurs', promesse: 'WhatsApp pro configure en 1h', prix: '49 EUR forfait lancement', status: 'A vendre', priorite: 'P1' },
  { name: 'Mini-site vitrine', cible: 'Traiteurs sans site', promesse: 'Page vitrine sur DeliKreol', prix: '79 EUR forfait lancement', status: 'A vendre', priorite: 'P1' },
  { name: 'Carte menu digitale', cible: 'Snacks, restaurants', promesse: 'Menu digital partageable', prix: '39 EUR forfait lancement', status: 'A vendre', priorite: 'P1' },
  { name: 'Pack visibilite traiteur', cible: 'Traiteurs partenaires', promesse: 'Visibilite premium sur DeliKreol', prix: '49 EUR/mois pilote', status: 'A vendre', priorite: 'P1' },
  { name: 'Recrutement livreurs', cible: 'Livreurs independants', promesse: 'Missions de livraison locales', prix: 'Commission livraison', status: 'A cadrer', priorite: 'P2' },
  { name: 'Sourcing Ikabay', cible: 'Importateurs, vendeurs', promesse: 'Acces fournisseurs caribeens', prix: 'A isoler hors DeliKreol Food', status: 'Phase 2', priorite: 'P2' },
  { name: 'Services SOS Galere', cible: 'Particuliers, artisans', promesse: 'Mise en relation locale', prix: 'A isoler hors DeliKreol Food', status: 'Phase 2', priorite: 'P2' },
];

export function AdminOffres() {
  useEffect(() => { document.title = 'Offres cash — Admin DeliKreol'; }, []);

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
        <DollarSign className="w-6 h-6 text-primary" />
        Offres cash
      </h1>
      <div className="mb-6 rounded-xl border bg-amber-50 p-4 text-sm text-amber-900">
        Priorite commerciale: vendre d'abord les offres P0/P1 par devis, WhatsApp ou virement confirme.
        Ne pas encaisser automatiquement tant que les mentions legales, le compte pro et les webhooks Stripe ne sont pas valides.
      </div>
      <div className="space-y-4">
        {offres.map((offre, i) => (
          <div key={i} className="bg-card rounded-xl border p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold">{offre.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${offre.status === 'Actif' ? 'bg-green-100 text-green-700' : offre.status === 'Phase 2' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'}`}>
                    {offre.status}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {offre.priorite}
                  </span>
                </div>
                <div className="grid sm:grid-cols-3 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Cible :</span> {offre.cible}</div>
                  <div><span className="text-muted-foreground">Promesse :</span> {offre.promesse}</div>
                  <div><span className="text-muted-foreground">Prix :</span> {offre.prix}</div>
                </div>
              </div>
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Offre: ${offre.name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-success hover:text-success flex-shrink-0"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminOffres;
