import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CARDS, PER_CARD_BUDGET_GZIP, type CardMeasurement } from '../src/cards/registry';
import { CARD_RENDERERS } from '../src/cards/presets';

const repoRoot = new URL('..', import.meta.url).pathname;
const vendorLib = join(repoRoot, 'vendor', 'threeui', 'lib');
const distAssets = join(repoRoot, 'dist', 'assets');

const vendorManifest = JSON.parse(readFileSync(join(repoRoot, 'vendor/threeui.manifest.json'), 'utf8')) as {
  moduleDirs: string[];
};
const byteReport = JSON.parse(
  readFileSync(join(repoRoot, 'src/lib/card-bytes.json'), 'utf8'),
) as { budgetPerCardGzipBytes: number; cards: Record<string, CardMeasurement> };

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const vendoredJs = walk(vendorLib).filter((file) => file.endsWith('.js'));

describe('card registry', () => {
  it('ships at least 12 cards drawn from at least 3 categories', () => {
    expect(CARDS.length).toBeGreaterThanOrEqual(12);
    expect(new Set(CARDS.map((card) => card.category)).size).toBeGreaterThanOrEqual(3);
  });

  it('uses unique ids, unique names and unique vendored module directories', () => {
    expect(new Set(CARDS.map((card) => card.id)).size).toBe(CARDS.length);
    expect(new Set(CARDS.map((card) => card.name)).size).toBe(CARDS.length);
    const dirs = CARDS.map((card) => card.module.split('/')[0]);
    expect(new Set(dirs).size).toBe(dirs.length);
  });

  it('has a live renderer for every card, and no renderer for anything else', () => {
    expect(Object.keys(CARD_RENDERERS).sort()).toEqual(CARDS.map((card) => card.id).sort());
  });

  it('gives every card a still, so a card with no GPU still shows something', () => {
    for (const card of CARDS) {
      expect(card.still.pattern, `${card.id} still pattern`).toBeTruthy();
      for (const stop of [card.still.from, card.still.via, card.still.to]) {
        expect(stop, `${card.id} still colour`).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
    expect(CARDS.filter((card) => card.requiresGpu).length).toBeGreaterThan(0);
  });
});

describe('the iframe-document pattern is rejected', () => {
  it('vendors no module that renders a sandboxed iframe document', () => {
    const offenders = vendoredJs.filter((file) => /srcDoc|srcdoc|<iframe|"iframe"/.test(readFileSync(file, 'utf8')));
    expect(
      offenders.map((file) => file.slice(vendorLib.length + 1)),
      'a vendored module renders an iframe document; hard constraint 1 rejects that pattern',
    ).toEqual([]);
  });

  it('vendors no module that imports an HTML document string from a sources directory', () => {
    const documentImporters = vendoredJs.filter((file) =>
      /from\s+"\.\/sources\//.test(readFileSync(file, 'utf8')),
    );
    expect(documentImporters).toEqual([]);
  });

  it('vendors no module that reaches a remote origin at runtime', () => {
    const remote = vendoredJs.filter((file) =>
      /https?:\/\/(?!www\.w3\.org)/.test(readFileSync(file, 'utf8')),
    );
    expect(
      remote.map((file) => file.slice(vendorLib.length + 1)),
      'a vendored module references a remote origin; the build must never depend on the vendor server',
    ).toEqual([]);
  });

  it('keeps the vendored tree to the allowlisted module directories', () => {
    const allowed = new Set(vendorManifest.moduleDirs.map((dir) => dir.split('/').pop()));
    const present = new Set(
      readdirSync(vendorLib, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name),
    );
    expect([...present].sort()).toEqual([...allowed].sort());
  });
});

describe('the Three dependency trap is defused', () => {
  it('installs no aliased Three copies at all', () => {
    const pkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8')) as {
      dependencies: Record<string, string>;
    };
    expect(Object.keys(pkg.dependencies).filter((name) => /^three\d+$/.test(name))).toEqual([]);
    expect(existsSync(join(repoRoot, 'node_modules/three128'))).toBe(false);
    expect(existsSync(join(repoRoot, 'node_modules/three165'))).toBe(false);
  });

  it('points both upstream Three aliases at the single Three dependency', () => {
    const alias = readFileSync(join(repoRoot, 'build/three-alias.ts'), 'utf8');
    expect(alias).toContain("three128: 'three'");
    expect(alias).toContain("three165: 'three'");
    const viteConfig = readFileSync(join(repoRoot, 'vite.config.ts'), 'utf8');
    expect(viteConfig).toContain('THREE_ALIASES');
  });

  it.runIf(existsSync(distAssets))('emits no chunk that still imports an unresolved Three alias', () => {
    const offenders = walk(distAssets)
      .filter((file) => file.endsWith('.js'))
      .filter((file) => /from\s*"three\d+"/.test(readFileSync(file, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it.runIf(existsSync(distAssets))('emits exactly one shared Three chunk', () => {
    const threeChunks = readdirSync(distAssets).filter((file) => /^three-.*\.js$/.test(file));
    expect(threeChunks).toHaveLength(1);
  });
});

describe('per-card byte budget', () => {
  it('has a measured figure for every card', () => {
    for (const card of CARDS) {
      expect(byteReport.cards[card.id], `${card.id} has no measured figure`).toBeDefined();
      expect(byteReport.cards[card.id]!.jsGzip).toBeGreaterThan(0);
    }
    expect(Object.keys(byteReport.cards).sort()).toEqual(CARDS.map((card) => card.id).sort());
  });

  it('keeps every card under the per-card ceiling', () => {
    const budget = JSON.parse(readFileSync(join(repoRoot, 'budget.json'), 'utf8')) as {
      perCardGzipBytes: number;
    };
    expect(byteReport.budgetPerCardGzipBytes).toBe(budget.perCardGzipBytes);
    for (const card of CARDS) {
      const { jsGzip, assetBytes } = byteReport.cards[card.id]!;
      expect(jsGzip + assetBytes, `${card.id} is over budget`).toBeLessThanOrEqual(PER_CARD_BUDGET_GZIP);
    }
  });

  it('reports asset bytes honestly: this catalogue has no binary card assets', () => {
    for (const card of CARDS) {
      expect(byteReport.cards[card.id]!.assetBytes, `${card.id} asset bytes`).toBe(0);
    }
  });

  it('keeps the vendored tree small enough to audit by hand', () => {
    const total = walk(vendorLib).reduce((sum, file) => sum + statSync(file).size, 0);
    expect(total).toBeLessThan(2 * 1024 * 1024);
  });
});
