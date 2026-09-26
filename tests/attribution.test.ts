import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { CARDS, CREDIT, UPSTREAM_NOTICE } from '../src/cards/registry';
import type { AttributionFile, GalleryManifest } from '../src/cards/schema';

const manifest = JSON.parse(readFileSync(new URL('../cards.json', import.meta.url), 'utf8')) as GalleryManifest;
const attribution = JSON.parse(
  readFileSync(new URL('../attribution.json', import.meta.url), 'utf8'),
) as AttributionFile;

describe('attribution.json', () => {
  it('has exactly one record per shipped card, and no record for a card we do not ship', () => {
    expect(attribution.cards.map((entry) => entry.id).sort()).toEqual(
      manifest.cards.map((card) => card.id).sort(),
    );
  });

  it('records a real https source URL on the upstream catalogue for every card', () => {
    for (const entry of attribution.cards) {
      expect(entry.sourceUrl, `${entry.id} sourceUrl`).toMatch(/^https:\/\/threeui\.com\/[a-z0-9/-]+$/);
      expect(entry.sourceUrl.endsWith('/'), `${entry.id} sourceUrl is a page, not a directory`).toBe(false);
    }
  });

  it('records the MIT licence and upstream copyright for every card', () => {
    for (const entry of attribution.cards) {
      expect(entry.licence, `${entry.id} licence`).toBe('MIT');
      expect(entry.copyright, `${entry.id} copyright`).toBe('Copyright (c) 2026 Meng To');
    }
  });

  it('points every vendoredPath at a directory that exists in the vendored tree', () => {
    for (const entry of attribution.cards) {
      expect(entry.vendoredPath, `${entry.id} vendoredPath`).toMatch(/^vendor\/threeui\/lib\/[a-z0-9-]+$/);
    }
  });

  it('carries the upstream notice and names the licence files that hold the full text', () => {
    expect(CREDIT.licence).toBe('MIT');
    expect(CREDIT.copyright).toBe('Copyright (c) 2026 Meng To');
    expect(UPSTREAM_NOTICE).toMatch(/MIT License/);
    expect(UPSTREAM_NOTICE).toMatch(/not affiliated with, endorsed by/);
    expect(CREDIT.modification).toMatch(/MIT notice obligation is unaffected/);
    for (const key of ['licenceFile', 'noticeFile', 'assetLicenceFile', 'fontLicenceFile'] as const) {
      expect(readFileSync(new URL(`../${attribution.upstream[key]}`, import.meta.url), 'utf8')).toBeTruthy();
    }
  });
});

describe('third-party notices', () => {
  it('declares the NASA Blue Marble case with an empty appliesTo, because no shipped card uses it', () => {
    const nasa = attribution.thirdParty.find((entry) => entry.id === 'nasa-blue-marble');
    expect(nasa, 'the known NASA case must stay recorded').toBeDefined();
    expect(nasa!.appliesTo).toEqual([]);
  });

  it('bundles no OFL font, so no Reserved Font Name can be infringed', () => {
    const fonts = attribution.thirdParty.find((entry) => entry.id === 'bundled-fonts');
    expect(fonts, 'the font position must stay recorded').toBeDefined();
    expect(fonts!.appliesTo).toEqual([]);
    expect(fonts!.reservedFontNames ?? []).toEqual([]);
    expect(fonts!.notice).toMatch(/strips the @font-face rule at vendor time/);
  });

  it('attributes Three.js to exactly the cards that pull it in', () => {
    const three = attribution.thirdParty.find((entry) => entry.id === 'three');
    expect(three).toBeDefined();
    const expected = CARDS.filter((card) => card.render === 'three')
      .map((card) => card.id)
      .sort();
    expect([...three!.appliesTo].sort()).toEqual(expected);
  });
});
