function assetFromPublic(relativePath: string): string {
  const clean = relativePath.replace(/^\//, '');
  return `${import.meta.env.BASE_URL}${clean}`;
}

export const anTjeCocoAssets = {
  hero: assetFromPublic('vendors/an-tje-coco/hero.jpg'),
  gallery: [
    assetFromPublic('vendors/an-tje-coco/gallery-01.jpg'),
    assetFromPublic('vendors/an-tje-coco/gallery-02.jpg'),
    assetFromPublic('vendors/an-tje-coco/gallery-03.jpg'),
    assetFromPublic('vendors/an-tje-coco/gallery-04.jpg'),
    assetFromPublic('vendors/an-tje-coco/gallery-05.jpg'),
  ],
  event: 'https://api.cloudly.space/resize/crop/1200/627/60/aHR0cDovL21lZGlhcy50b3VyaXNtLXN5c3RlbS5jb20vNy8yLzgwNDcxN180MjIxMDY0NDlfMzgyMzMzMzc0NDkzOTczXzM3OTE3NTkwNjM3OTIwNjc4MzFfbi5qcGVn/image.jpg',
};

export const cocoFoodAssets = {
  hero: assetFromPublic('vendors/coco/hero.jpg'),
  gallery: [
    // 14 vraies photos WhatsApp mai 2026 — optimisées et rehaussées
    assetFromPublic('vendors/coco/gallery-01.jpg'),  // Plat complet festif
    assetFromPublic('vendors/coco/gallery-02.jpg'),  // Assiette généreuse
    assetFromPublic('vendors/coco/gallery-03.jpg'),  // Plateau traiteur
    assetFromPublic('vendors/coco/gallery-04.jpg'),  // Grande préparation
    assetFromPublic('vendors/coco/gallery-05.jpg'),  // Plat en portion
    assetFromPublic('vendors/coco/gallery-06.jpg'),  // Plateau complet
    assetFromPublic('vendors/coco/gallery-07.jpg'),  // Box poisson & avocat + jus
    assetFromPublic('vendors/coco/gallery-08.jpg'),  // Brochettes panées, lentilles, brocoli
    assetFromPublic('vendors/coco/gallery-09.jpg'),  // Paella noire aux fruits de mer
    assetFromPublic('vendors/coco/gallery-10.jpg'),  // Plat du jour complet
    assetFromPublic('vendors/coco/gallery-11.jpg'),  // Salade viande marinée
    assetFromPublic('vendors/coco/gallery-12.jpg'),  // Box viande grillée
    assetFromPublic('vendors/coco/gallery-13.jpg'),  // Friture caramélisée
    assetFromPublic('vendors/coco/gallery-14.jpg'),  // Poulet rôti, riz aux pois
  ],
};
