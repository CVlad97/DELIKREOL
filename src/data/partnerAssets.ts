export const anTjeCocoAssets = {
  hero: 'https://antilla-martinique.com/wp-content/uploads/2025/01/Photo-une2.jpg',
  gallery: [
    'https://antilla-martinique.com/wp-content/uploads/2025/01/Pepite-Passion-Coulis-framboise-e1738112333674.jpg',
    'https://antilla-martinique.com/wp-content/uploads/2025/01/Pepite-Pina-colada-e1738112614353.jpeg',
    'https://antilla-martinique.com/wp-content/uploads/2025/01/Pepite-trois-chocolats.jpeg',
    'https://antilla-martinique.com/wp-content/uploads/2025/01/Creme-brulee-Passion.jpeg',
    'https://antilla-martinique.com/wp-content/uploads/2025/01/Montblanc-01.Post2_.jpeg',
  ],
  event: 'https://api.cloudly.space/resize/crop/1200/627/60/aHR0cDovL21lZGlhcy50b3VyaXNtLXN5c3RlbS5jb20vNy8yLzgwNDcxN180MjIxMDY0NDlfMzgyMzMzMzc0NDkzOTczXzM3OTE3NTkwNjM3OTIwNjc4MzFfbi5qcGVn/image.jpg',
};

const assetFromPublic = (relativePath: string): string => {
  const clean = relativePath.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${clean}`;
};

export const cocoFoodAssets = {
  hero: assetFromPublic('vendors/coco/hero.jpg'),
  gallery: [
    assetFromPublic('vendors/coco/gallery-01.jpg'),
    assetFromPublic('vendors/coco/gallery-02.jpg'),
    assetFromPublic('vendors/coco/gallery-03.jpg'),
    assetFromPublic('vendors/coco/gallery-04.jpg'),
    assetFromPublic('vendors/coco/gallery-05.jpg'),
    assetFromPublic('vendors/coco/gallery-06.jpg'),
    assetFromPublic('vendors/coco/gallery-07.jpg'),
    assetFromPublic('vendors/coco/gallery-08.jpg'),
    assetFromPublic('vendors/coco/gallery-09.jpg'),
    assetFromPublic('vendors/coco/gallery-10.jpg'),
    assetFromPublic('vendors/coco/gallery-11.jpg'),
    assetFromPublic('vendors/coco/gallery-12.jpg'),
    assetFromPublic('vendors/coco/gallery-13.jpg'),
    assetFromPublic('vendors/coco/gallery-14.jpg'),
    assetFromPublic('vendors/coco/gallery-15.jpg'),
    assetFromPublic('vendors/coco/gallery-16.jpg'),
    assetFromPublic('vendors/coco/gallery-17.jpg'),
    assetFromPublic('vendors/coco/gallery-18.jpg'),
    assetFromPublic('vendors/coco/gallery-19.jpg'),
    assetFromPublic('vendors/coco/gallery-20.jpg'),
    assetFromPublic('vendors/coco/gallery-21.jpg'),
    assetFromPublic('vendors/coco/gallery-22.jpg'),
    assetFromPublic('vendors/coco/gallery-23.jpg'),
    assetFromPublic('vendors/coco/gallery-24.jpg'),
    assetFromPublic('vendors/coco/gallery-25.jpg'),
  ],
};
