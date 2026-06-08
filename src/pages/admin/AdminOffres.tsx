import { useEffect } from 'react';
import { DollarSign, MessageCircle } from 'lucide-react';

const WHATSAPP = '596696653589';

const offres = [
  { name: 'Commande repas DeliKreol', cible: 'Particuliers, familles', promesse: 'Commander un repas local en 2 minutes', prix: 'Commission sur commande', status: 'Actif' },
  { name: 'Devis traiteur événementiel', cible: 'Particuliers, entreprises', promesse: 'Devis personnalisé sous 24h', prix: 'Commission sur devis accepté', status: 'Actif' },
  { name: 'Repas entreprise', cible: 'Entreprises, CE, associations', promesse: 'Repas groupe clé en main', prix: 'À définir', status: 'À lancer' },
  { name: 'Configuration WhatsApp Business', cible: 'Traiteurs, restaurateurs', promesse: 'WhatsApp pro configuré en 1h', prix: 'À définir', status: 'À lancer' },
  { name: 'Mini-site vitrine', cible: 'Traiteurs sans site', promesse: 'Page vitrine sur DeliKreol', prix: 'À définir', status: 'À lancer' },
  { name: 'Carte menu digitale', cible: 'Snacks, restaurants', promesse: 'Menu digital partageable', prix: 'À définir', status: 'À lancer' },
  { name: 'Sourcing Ikabay', cible: 'Importateurs, vendeurs', promesse: 'Accès fournisseurs caribéens', prix: 'À définir', status: 'Phase 2' },
  { name: 'Services SOS Galère', cible: 'Particuliers, artisans', promesse: 'Mise en relation locale', prix: 'À définir', status: 'Phase 2' },
  { name: 'Recrutement livreurs', cible: 'Livreurs indépendants', promesse: 'Missions de livraison locales', prix: 'Commission livraison', status: 'À lancer' },
  { name: 'Pack visibilité traiteur', cible: 'Traiteurs partenaires', promesse: 'Visibilité premium sur DeliKreol', prix: 'À définir', status: 'À lancer' },
];

export function AdminOffres() {
  useEffect(() => { document.title = 'Offres cash — Admin DeliKreol'; }, []);

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
        <DollarSign className="w-6 h-6 text-primary" />
        Offres cash
      </h1>
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
                className="text-emerald-600 hover:text-emerald-700 flex-shrink-0"
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
