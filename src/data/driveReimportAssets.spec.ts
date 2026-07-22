import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { driveReimportGalleries, driveReimportPortraits } from './driveReimportAssets';

const expectedDrivePreimportCounts = {
  coco: 27,
  ninice: 11,
  savePeyia: 12,
  saveursAfrique: 12,
  sweetFamily: 11,
  gouteMwen: 26,
} as const;

function publicPathFromAsset(asset: string) {
  return asset.replace(/^\/+/, '').split('?')[0];
}

describe('driveReimportAssets', () => {
  it('matches the validated Drive preimport counts', () => {
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
      driveReimportPortraits.ninice,
      driveReimportPortraits.gouteMwen,
    ];

    const missingAssets = publishedAssets.filter((asset) => {
      const publicPath = publicPathFromAsset(asset);
      return !existsSync(resolve(process.cwd(), 'public', publicPath));
    });

    expect(missingAssets).toEqual([]);
  });
});
