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
  license: string;
  copyright: string;
  vendoredPath: string;
  additionalNotices: string[];
}

export interface ThirdPartyNotice {
  id: string;
  name: string;
  license: string;
  appliesTo: string[];
  reservedFontNames?: ReservedFontName[];
  notice: string;
}

/**
 * An OFL 1.1 Reserved Font Name the upstream package ships.
 *
 * `upstreamFamily` is deliberately a placeholder in this repository. An OFL Reserved Font Name may
 * not be used by a derivative work, so the record states that one exists and points at the upstream
 * licence file rather than reproducing the string. The compliance test sweeps the built bundle for
 * the name to keep it that way.
 */
export interface ReservedFontName {
  upstreamFamily: string;
  license: string;
  reserved: boolean;
  usedHere: boolean;
  note: string;
}

export interface AttributionFile {
  upstream: {
    package: string;
    version: string;
    license: string;
    copyright: string;
    catalogue: string;
    licenseFile: string;
    noticeFile: string;
    assetLicenseFile: string;
    fontLicenseFile: string;
    notice: string;
    modification: string;
  };
  thirdParty: ThirdPartyNotice[];
  cards: AttributionRecord[];
}
