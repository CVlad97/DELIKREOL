import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { driveReimportGalleries, driveReimportLogos, driveReimportPortraits } from './driveReimportAssets';

const expectedDrivePreimportCounts = {
  coco: 26,
  ninice: 12,
  savePeyia: 10,
  saveursAfrique: 11,
  sweetFamily: 18,
  gouteMwen: 20,
} as const;

function publicPathFromAsset(asset: string) {
  return asset.replace(/^\/+/, '').split('?')[0];
}

describe('driveReimportAssets', () => {
  it('matches the curated bankable Drive preimport counts', () => {
    expect(driveReimportGalleries.coco).toHaveLength(expectedDrivePreimportCounts.coco);
    expect(driveReimportGalleries.ninice).toHaveLength(expectedDrivePreimportCounts.ninice);
    expect(driveReimportGalleries.savePeyia).toHaveLength(expectedDrivePreimportCounts.savePeyia);
    expect(driveReimportGalleries.saveursAfrique).toHaveLength(expectedDrivePreimportCounts.saveursAfrique);
    expect(driveReimportGalleries.sweetFamily).toHaveLength(expectedDrivePreimportCounts.sweetFamily);
    expect(driveReimportGalleries.gouteMwen).toHaveLength(expectedDrivePreimportCounts.gouteMwen);
  });

  it('points every published Drive preimport asset to an existing local file', () => {
    const publishedAssets = [
      ...driveReimportGalleries.coco,
      ...driveReimportGalleries.ninice,
      ...driveReimportGalleries.savePeyia,
      ...driveReimportGalleries.saveursAfrique,
      ...driveReimportGalleries.sweetFamily,
      ...driveReimportGalleries.gouteMwen,
      driveReimportLogos.coco,
      driveReimportLogos.chefAMada,
      driveReimportPortraits.coco,
      driveReimportPortraits.ninice,
      driveReimportPortraits.gouteMwen,
    ];

    const missingAssets = publishedAssets.filter((asset) => {
      const publicPath = publicPathFromAsset(asset);
      return !existsSync(resolve(process.cwd(), 'public', publicPath));
    });

    expect(missingAssets).toEqual([]);
  });

  it('keeps logos and profile assets out of food galleries', () => {
    const galleryAssets = Object.values(driveReimportGalleries).flat();

    expect(galleryAssets.some((asset) => asset.includes('/profile.svg'))).toBe(false);
    expect(galleryAssets.some((asset) => asset.includes('/logo.'))).toBe(false);
    expect(driveReimportLogos.coco).toContain('/profile.svg');
  });

  it('excludes mismatched Saveurs Afrique photos without deleting originals', () => {
    expect(driveReimportGalleries.saveursAfrique).not.toEqual(
      expect.arrayContaining([
        expect.stringContaining('IMG-20260612-WA0205.jpg'),
        expect.stringContaining('IMG-20260526-WA0162.jpg'),
      ]),
    );
  });
});
