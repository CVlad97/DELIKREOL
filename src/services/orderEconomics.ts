export type EconomicsInput = {
  items: Array<{ price: number; quantity?: number; commissionRate?: number }>;
  deliveryFee?: number;
  serviceFee?: number;
  paymentCost?: number;
  courierPayout?: number;
  discount?: number;
};

export function calculateOrderEconomics(input: EconomicsInput) {
  const subtotalProduits = input.items.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0);
  const fraisLivraison = input.deliveryFee ?? 0;
  const fraisService = input.serviceFee ?? 0;
  const remise = input.discount ?? 0;
  const totalClient = Math.max(0, subtotalProduits + fraisLivraison + fraisService - remise);
  const commissionPlateforme = input.items.reduce(
    (sum, item) => sum + item.price * (item.quantity ?? 1) * (item.commissionRate ?? 0.15),
    0,
  );
  const coutPaiement = input.paymentCost ?? 0;
  const remunerationLivreurOuPrestataire = input.courierPayout ?? fraisLivraison;
  const remunerationVendeur = Math.max(0, subtotalProduits - commissionPlateforme);
  const margeNettePlateforme = totalClient - remunerationVendeur - remunerationLivreurOuPrestataire - coutPaiement;

  return {
    subtotal_produits: roundMoney(subtotalProduits),
    frais_livraison: roundMoney(fraisLivraison),
    frais_service: roundMoney(fraisService),
    total_client: roundMoney(totalClient),
    commission_plateforme: roundMoney(commissionPlateforme),
    cout_paiement: roundMoney(coutPaiement),
    remuneration_vendeur: roundMoney(remunerationVendeur),
    remuneration_livreur_ou_prestataire: roundMoney(remunerationLivreurOuPrestataire),
    marge_nette_plateforme: roundMoney(margeNettePlateforme),
  };
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
