function assetFromPublic(relativePath: string): string {
  const clean = relativePath.replace(/^\//, '');
  return `${import.meta.env.BASE_URL}${clean}`;
}

export const anTjeCocoAssets = {
  hero: assetFromPublic('vendors/an-tje-coco/clean/hero-clean.webp'),
  gallery: [
    assetFromPublic('vendors/an-tje-coco/clean/gallery-01-clean.webp'),
    assetFromPublic('vendors/an-tje-coco/clean/gallery-02-clean.webp'),
    assetFromPublic('vendors/an-tje-coco/clean/gallery-03-clean.webp'),
    assetFromPublic('vendors/an-tje-coco/clean/gallery-04-clean.webp'),
    assetFromPublic('vendors/an-tje-coco/clean/gallery-05-clean.webp'),
  ],
  event: 'https://api.cloudly.space/resize/crop/1200/627/60/aHR0cDovL21lZGlhcy50b3VyaXNtLXN5c3RlbS5jb20vNy8yLzgwNDcxN180MjIxMDY0NDlfMzgyMzMzMzc0NDkzOTczXzM3OTE3NTkwNjM3OTIwNjc4MzFfbi5qcGVn/image.jpg',
};

export const cocoFoodAssets = {
  hero: assetFromPublic('vendors/coco/drive-import/drive-09.webp'),
  gallery: [
    // Originaux Drive mai 2026, sans cadres ni saturation artificielle.
    assetFromPublic('vendors/coco/drive-import/drive-01.webp'),
    assetFromPublic('vendors/coco/drive-import/drive-02.webp'),
    assetFromPublic('vendors/coco/drive-import/drive-03.webp'),
    assetFromPublic('vendors/coco/drive-import/drive-05.webp'),
    assetFromPublic('vendors/coco/drive-import/drive-06.webp'),
    assetFromPublic('vendors/coco/drive-import/drive-08.webp'),
    assetFromPublic('vendors/coco/drive-import/drive-09.webp'),
    assetFromPublic('vendors/coco/drive-import/drive-12.webp'),
    assetFromPublic('vendors/coco/drive-import/drive-14.webp'),
    assetFromPublic('vendors/coco/drive-import/drive-16.webp'),
    assetFromPublic('vendors/coco/drive-import/drive-17.webp'),
    assetFromPublic('vendors/coco/drive-import/drive-18.webp'),
    assetFromPublic('vendors/coco/drive-import/drive-19.webp'),
    assetFromPublic('vendors/coco/drive-import/drive-20.webp'),
    assetFromPublic('vendors/coco/drive-import/drive-21.webp'),
    assetFromPublic('vendors/coco/drive-import/drive-22.webp'),
    assetFromPublic('vendors/coco/drive-import/drive-23.webp'),
    assetFromPublic('vendors/coco/drive-import/drive-24.webp'),
    assetFromPublic('vendors/coco/drive-import/drive-25.webp'),
    assetFromPublic('vendors/coco/drive-import/drive-26.webp'),
  ],
};
