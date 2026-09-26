export const CATEGORIES = [
  'background',
  'scene',
  'effect',
  'text',
  'control',
  'motion',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  background: 'Backgrounds',
  scene: 'Scenes',
  effect: 'Effects',
  text: 'Text',
  control: 'Controls',
  motion: 'Motion',
};

export const STILL_PATTERNS = [
  'rain',
  'dots',
  'horizon',
  'orbit',
  'contour',
  'streaks',
  'blob',
  'ribbon',
  'drops',
  'stream',
  'scanlines',
  'blade',
  'rings',
  'toggle',
  'pill',
  'dock',
] as const;

export type StillPattern = (typeof STILL_PATTERNS)[number];

export type Renderer = 'three' | 'raw-webgl' | 'canvas2d' | 'dom';

export interface StillDefinition {
  pattern: StillPattern;
  from: string;
  via: string;
  to: string;
}

export interface CardDefinition {
  id: string;
  name: string;
  category: Category;
  /** Path of the vendored module, relative to the vendored library root, without extension. */
  module: string;
  /** Path of the item's page on the source catalogue, used to build `sourceUrl` in attribution.json. */
  sourcePath: string;
  /** True when the component needs a GPU context to render anything at all. */
  requiresGpu: boolean;
  render: Renderer;
  description: string;
  still: StillDefinition;
}

export interface GalleryManifest {
  sourcePackage: string;
  sourceLicence: string;
  sourceNoticeRequired: boolean;
  cards: CardDefinition[];
}

export interface AttributionRecord {
  id: string;
  sourceUrl: string;
  licence: string;
  copyright: string;
  vendoredPath: string;
  additionalNotices: string[];
}

export interface ThirdPartyNotice {
  id: string;
  name: string;
  licence: string;
  appliesTo: string[];
  reservedFontNames?: string[];
  notice: string;
}

export interface AttributionFile {
  upstream: {
    package: string;
    version: string;
    licence: string;
    copyright: string;
    catalogue: string;
    licenceFile: string;
    noticeFile: string;
    assetLicenceFile: string;
    fontLicenceFile: string;
    notice: string;
    modification: string;
  };
  thirdParty: ThirdPartyNotice[];
  cards: AttributionRecord[];
}
