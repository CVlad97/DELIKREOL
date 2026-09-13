import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { driveReimportGalleries, driveReimportPortraits } from './driveReimportAssets';

const expectedDrivePublishedCounts = {
  coco: 26,
  ninice: 11,
  savePeyia: 12,
  saveursAfrique: 13,
  sweetFamily: 11,
} as const;

const expectedSuppliedNonDriveCounts = {
  gouteMwen: 20,
} as const;

function publicPathFromAsset(asset: string) {
  return asset.replace(/^\/+/, '').split('?')[0];
}

describe('driveReimportAssets', () => {
  it('matches the validated Drive WhatsApp photo counts', () => {
    expect(driveReimportGalleries.coco).toHaveLength(expectedDrivePublishedCounts.coco);
    expect(driveReimportGalleries.ninice).toHaveLength(expectedDrivePublishedCounts.ninice);
    expect(driveReimportGalleries.savePeyia).toHaveLength(expectedDrivePublishedCounts.savePeyia);
    expect(driveReimportGalleries.saveursAfrique).toHaveLength(expectedDrivePublishedCounts.saveursAfrique);
    expect(driveReimportGalleries.sweetFamily).toHaveLength(expectedDrivePublishedCounts.sweetFamily);
  });

  it('keeps Gouté Mwen out of the Drive WhatsApp count because no Drive source exists yet', () => {
    expect(driveReimportGalleries.gouteMwen).toHaveLength(expectedSuppliedNonDriveCounts.gouteMwen);
  });

  it('points every published or supplied asset to an existing local file', () => {
    const publishedAssets = [
      ...driveReimportGalleries.coco,
      ...driveReimportGalleries.ninice,
      ...driveReimportGalleries.savePeyia,
      ...driveReimportGalleries.saveursAfrique,
      ...driveReimportGalleries.sweetFamily,
      ...driveReimportGalleries.gouteMwen,
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
});