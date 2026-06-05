export const simpleMainMenuLinks = [
  { label: 'Commander', href: '?view=customer#catalogue' },
  { label: 'Traiteurs', href: '?view=traiteurs' },
  { label: 'Livraison', href: '#livraison' },
  { label: 'Points relais', href: '#points-relais' },
  { label: 'Devenir partenaire', href: '#partenaires' },
  { label: 'Contact WhatsApp', href: 'https://wa.me/596696653589' },
];

export const simpleCategoryFilters = [
  'Tous',
  'Plats',
  'Snacking',
  'Desserts',
  'Boissons',
  'Traiteur événementiel',
  'Commandes entreprise',
];

export const simpleProductFilters = [
  { key: 'commune', label: 'Ville / commune', type: 'commune-list' },
  { key: 'category', label: 'Catégorie', type: 'multi-select' },
  { key: 'vendor', label: 'Traiteur', type: 'multi-select' },
  { key: 'price', label: 'Budget', type: 'range' },
  { key: 'fulfillment', label: 'Retrait ou livraison', type: 'multi-select' },
  { key: 'availability', label: 'Disponible / à confirmer', type: 'multi-select' },
];

export const partnerProductSimulatorFields = [
  'Nom du produit',
  'Ville / commune',
  'Catégorie',
  'Prix',
  'Description courte',
  'Photo du plat',
  'Horaires de retrait',
  'Livraison possible',
  'Heure limite de commande',
  'Minimum de commande',
];

export const deliveryWinWinRules = {
  extendedDeliveryThreshold: 40,
  message:
    'Livraison éloignée possible à partir de 40 € de commande, selon validation du prestataire et disponibilité DeliKreol.',
  fallbackCta: 'Vérifier la possibilité par WhatsApp',
};

export const humanUxMessages = {
  futureTagline: 'Le meilleur est à venir.',
  formSaved: 'Votre demande a bien été reçue. Nous revenons vers vous rapidement par WhatsApp.',
  productDraftSaved: 'Produit enregistré en brouillon. DeliKreol le vérifiera avant publication.',
  lateOrder:
    'L’heure limite est peut-être dépassée. On peut quand même vérifier avec le prestataire avant de refuser.',
  cartEmpty: 'Ajoutez un plat pour commencer.',
};
