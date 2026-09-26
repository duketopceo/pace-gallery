import type { CardDefinition, GalleryManifest, AttributionFile } from './schema';
import { CATEGORIES, CATEGORY_LABELS } from './schema';
import manifest from '../../cards.json';
import attribution from '../../attribution.json';
import byteReport from '../lib/card-bytes.json';

export type { CardDefinition, StillPattern, Category, Renderer } from './schema';
export { CATEGORIES, CATEGORY_LABELS } from './schema';

const cardManifest = manifest as GalleryManifest;
const attributionFile = attribution as AttributionFile;

export interface CardMeasurement {
  jsGzip: number;
  assetBytes: number;
}

interface ByteReport {
  budgetPerCardGzipBytes: number;
  sharedRuntimeGzip: number;
  cardCount: number;
  cards: Record<string, CardMeasurement>;
}

const bytes = byteReport as ByteReport;

export interface Card extends CardDefinition {
  sourceUrl: string;
  licence: string;
  copyright: string;
  additionalNotices: readonly string[];
  bytes: CardMeasurement;
}

const attributionById = new Map(attributionFile.cards.map((entry) => [entry.id, entry]));

function buildCard(definition: CardDefinition): Card {
  const record = attributionById.get(definition.id);
  if (!record) {
    throw new Error(`attribution.json has no entry for card "${definition.id}"`);
  }
  const measured = bytes.cards[definition.id];
  return {
    ...definition,
    sourceUrl: record.sourceUrl,
    licence: record.licence,
    copyright: record.copyright,
    additionalNotices: record.additionalNotices,
    bytes: measured ?? { jsGzip: 0, assetBytes: 0 },
  };
}

export const CARDS: readonly Card[] = cardManifest.cards.map(buildCard);

/**
 * The credit fields the page renders. Referenced property by property so the bundler keeps only
 * these strings out of `attribution.json`; exporting the whole file would pull every provenance
 * record into the entry chunk.
 */
export const CREDIT = {
  package: attributionFile.upstream.package,
  version: attributionFile.upstream.version,
  licence: attributionFile.upstream.licence,
  copyright: attributionFile.upstream.copyright,
  modification: attributionFile.upstream.modification,
} as const;

export const UPSTREAM_NOTICE = attributionFile.upstream.notice;

export const PER_CARD_BUDGET_GZIP = bytes.budgetPerCardGzipBytes;
export const SHARED_RUNTIME_GZIP = bytes.sharedRuntimeGzip;

export const CATEGORY_ORDER = CATEGORIES.filter((category) =>
  CARDS.some((card) => card.category === category),
);

export function cardsByCategory(): { category: string; label: string; cards: Card[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    cards: CARDS.filter((card) => card.category === category),
  }));
}
