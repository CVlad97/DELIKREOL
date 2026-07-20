function assetFromPublic(relativePath: string): string {
  const clean = relativePath.replace(/^\//, '');
  return `${import.meta.env.BASE_URL}${clean}`;
}

export const anTjeCocoAssets = {
  hero: assetFromPublic('vendors/an-tje-coco/gallery-05.jpg'),
  gallery: [
    assetFromPublic('vendors/an-tje-coco/gallery-05.jpg'),
  ],
  event: 'https://api.cloudly.space/resize/crop/1200/627/60/aHR0cDovL21lZGlhcy50b3VyaXNtLXN5c3RlbS5jb20vNy8yLzgwNDcxN180MjIxMDY0NDlfMzgyMzMzMzc0NDkzOTczXzM3OTE3NTkwNjM3OTIwNjc4MzFfbi5qcGVn/image.jpg',
};

export const cocoFoodAssets = {
  hero: assetFromPublic('vendors/coco/drive-reimport/IMG-20260526-WA0064.jpg'),
  gallery: [
    assetFromPublic('vendors/coco/drive-reimport/IMG-20260526-WA0064.jpg'),
    assetFromPublic('vendors/coco/drive-reimport/IMG-20260526-WA0065.jpg'),
    assetFromPublic('vendors/coco/drive-reimport/IMG-20260526-WA0066.jpg'),
    assetFromPublic('vendors/coco/drive-reimport/IMG-20260526-WA0067.jpg'),
    assetFromPublic('vendors/coco/drive-reimport/IMG-20260526-WA0068.jpg'),
    assetFromPublic('vendors/coco/drive-reimport/IMG-20260526-WA0069.jpg'),
    assetFromPublic('vendors/coco/drive-reimport/IMG-20260526-WA0070.jpg'),
    assetFromPublic('vendors/coco/drive-reimport/IMG-20260526-WA0071.jpg'),
    assetFromPublic('vendors/coco/drive-reimport/IMG-20260526-WA0072.jpg'),
    assetFromPublic('vendors/coco/drive-reimport/IMG-20260526-WA0073.jpg'),
    assetFromPublic('vendors/coco/drive-reimport/IMG-20260526-WA0074.jpg'),
    assetFromPublic('vendors/coco/drive-reimport/IMG-20260526-WA0075.jpg'),
    assetFromPublic('vendors/coco/drive-reimport/IMG-20260526-WA0076.jpg'),
    assetFromPublic('vendors/coco/drive-reimport/IMG-20260526-WA0077.jpg'),
    assetFromPublic('vendors/coco/drive-reimport/IMG-20260526-WA0078.jpg'),
    assetFromPublic('vendors/coco/drive-reimport/IMG-20260526-WA0079.jpg'),
    assetFromPublic('vendors/coco/drive-reimport/IMG-20260526-WA0080.jpg'),
    assetFromPublic('vendors/coco/drive-reimport/IMG-20260526-WA0081.jpg'),
    assetFromPublic('vendors/coco/drive-reimport/IMG-20260526-WA0082.jpg'),
    assetFromPublic('vendors/coco/drive-reimport/IMG-20260526-WA0083.jpg'),
  ],
};
