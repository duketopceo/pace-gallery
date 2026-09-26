import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = new URL('..', import.meta.url).pathname;
const distDir = join(repoRoot, 'dist');

/** The vendor's product name, and the Reserved Font Name of a font its package bundles. */
const VENDOR_NAME = /three\s*ui/i;
const RESERVED_FONT_NAME = /lexend/i;

function walk(dir: string, filter: RegExp): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return walk(full, filter);
    return filter.test(entry.name) ? [full] : [];
  });
}

/**
 * Files where naming the vendor is required rather than forbidden: the provenance records that
 * make the MIT notice-retention obligation auditable, and the upstream licence files themselves.
 * Nothing a visitor can see is on this list.
 */
const PROVENANCE_FILES = new Set([
  'attribution.json',
  'cards.json',
  'vendor/threeui.manifest.json',
  'vendor/threeui/LICENSE',
  'vendor/threeui/THIRD_PARTY_NOTICES.md',
  'vendor/threeui/FONT-LICENSES.md',
  'vendor/threeui/ASSET-LICENSES.md',
  'vendor/threeui/README.md',
  'README.md',
  'THIRD_PARTY_NOTICES.md',
  'src/lib/card-bytes.json',
]);

/** Upstream code, byte-for-byte as published. Its internal identifiers are upstream's to keep. */
const isVendoredUpstream = (file: string) => file.startsWith(join(repoRoot, 'vendor/threeui/lib/'));

const relative = (file: string) => file.slice(repoRoot.length);

describe('no vendor branding in the product', () => {
  it('never names the vendor in our own source, styles, markup or data', () => {
    const offenders: string[] = [];
    for (const file of walk(join(repoRoot, 'src'), /\.(tsx?|css|json)$/)) {
      if (isVendoredUpstream(file) || PROVENANCE_FILES.has(relative(file))) continue;
      const text = readFileSync(file, 'utf8');
      // Import paths into the vendored tree are not branding, so drop them before scanning.
      const withoutImports = text.replace(/^import[^;]*;$/gm, '');
      if (VENDOR_NAME.test(withoutImports)) offenders.push(relative(file));
    }
    offenders.push(...['index.html'].filter((name) => VENDOR_NAME.test(readFileSync(join(repoRoot, name), 'utf8'))));
    expect(offenders, 'the source licence is not a trademark licence').toEqual([]);
  });

  it('keeps the vendor name out of the built document and the built stylesheet', () => {
    expect(existsSync(join(distDir, 'index.html')), 'run `npm run build` first').toBe(true);
    const offenders: string[] = [];
    for (const file of [...walk(distDir, /\.html$/), ...walk(distDir, /\.css$/)]) {
      if (VENDOR_NAME.test(readFileSync(file, 'utf8'))) offenders.push(relative(file));
    }
    expect(
      offenders,
      'the document title, meta tags and stylesheet are the product surface; the credit belongs in the footer',
    ).toEqual([]);
  });

  it('keeps the vendor name out of every card chunk, so no card renders it', () => {
    const offenders = walk(join(distDir, 'assets'), /^card-.*\.js$/).filter((file) =>
      VENDOR_NAME.test(readFileSync(file, 'utf8')),
    );
    expect(offenders.map(relative), 'a card renders the vendor name').toEqual([]);
  });

  it('still names the source in the entry chunk, because the notice has to accompany the code', () => {
    const entry = walk(join(distDir, 'assets'), /^index-.*\.js$/);
    expect(entry).toHaveLength(1);
    expect(VENDOR_NAME.test(readFileSync(entry[0]!, 'utf8')), 'the credit line must name the source').toBe(true);
  });

  it('keeps the product voice free of the vendor name, and puts it only in the credit line', () => {
    const header = readFileSync(join(repoRoot, 'src/components/PageHeader.tsx'), 'utf8');
    const copy = header.replace(/^import[^;]*;$/gm, '');
    expect(VENDOR_NAME.test(copy), 'the page title and lede are the product voice; credit belongs in the footer').toBe(
      false,
    );
    const footer = readFileSync(join(repoRoot, 'src/components/CreditFooter.tsx'), 'utf8');
    expect(footer).toContain('CREDIT.package');
    expect(footer).toContain('UPSTREAM_NOTICE');
  });

  it('credits the source, because the licence requires the notice to accompany the code', () => {
    const footer = readFileSync(join(repoRoot, 'src/components/CreditFooter.tsx'), 'utf8');
    const registry = readFileSync(join(repoRoot, 'src/cards/registry.ts'), 'utf8');
    expect(footer).toMatch(/redistributed/);
    expect(registry).toContain('sourceUrl');
    expect(registry).toMatch(/licence: attributionFile\.upstream\.licence/);
    const notices = readFileSync(join(repoRoot, 'THIRD_PARTY_NOTICES.md'), 'utf8');
    expect(notices).toMatch(/MIT License/);
    expect(notices).toMatch(/Meng To/);
  });

  it('keeps the upstream notice qualified as a source licence, not an endorsement', () => {
    const attribution = JSON.parse(readFileSync(join(repoRoot, 'attribution.json'), 'utf8')) as {
      upstream: { notice: string };
    };
    expect(attribution.upstream.notice).toMatch(/source licence, not a trademark licence/i);
    expect(attribution.upstream.notice).toMatch(/not affiliated with, endorsed by/);
  });

  it('is not named after the vendor', () => {
    const pkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8')) as { name: string };
    expect(VENDOR_NAME.test(pkg.name)).toBe(false);
    expect(VENDOR_NAME.test(join(repoRoot, 'index.html').split('/').slice(-2).join('/'))).toBe(false);
  });
});

describe('Reserved Font Names', () => {
  it('bundles no font file, so no OFL font can be modified and no name can be infringed', () => {
    const fonts = walk(repoRoot, /\.(woff2?|ttf|otf|eot)$/);
    expect(fonts, 'this gallery ships no fonts; it uses the system UI stack').toEqual([]);
  });

  it('ships no inline font payload', () => {
    for (const file of walk(join(repoRoot, 'vendor/threeui/lib'), /\.(css|js)$/)) {
      expect(readFileSync(file, 'utf8'), `${relative(file)} carries a base64 font payload`).not.toMatch(
        /data:font\//,
      );
    }
  });

  it('never uses a reserved font name in the document, the styles or a card chunk', () => {
    const offenders: string[] = [];
    for (const file of [
      ...walk(join(repoRoot, 'src'), /\.(tsx?|css)$/),
      ...walk(distDir, /\.(html|css)$/),
      ...walk(join(distDir, 'assets'), /^card-.*\.js$/),
    ]) {
      if (RESERVED_FONT_NAME.test(readFileSync(file, 'utf8'))) offenders.push(relative(file));
    }
    expect(offenders).toEqual([]);
  });

  it('declares a system font stack rather than a downloaded font', () => {
    const styles = readFileSync(join(repoRoot, 'src/styles.css'), 'utf8');
    expect(styles).toMatch(/font-family:\s*ui-sans-serif, system-ui/);
    expect(styles).not.toMatch(/@font-face/);
  });
});

describe('no secrets, no PII, no per-user tracking', () => {
  it('ships no analytics vendor, cookie API or client storage in the page sources', () => {
    const offenders: string[] = [];
    const trackers =
      /googletagmanager|gtag\(|plausible\(|matomo|hotjar|fullstory|sendBeacon|document\.cookie|localStorage|sessionStorage|navigator\.sendBeacon/;
    for (const file of [...walk(join(repoRoot, 'src'), /\.(tsx?|ts|css)$/), join(repoRoot, 'index.html')]) {
      if (isVendoredUpstream(file)) continue;
      if (trackers.test(readFileSync(file, 'utf8'))) offenders.push(relative(file));
    }
    expect(offenders).toEqual([]);
  });

  it('ships no environment variable read, so no secret or per-deployment value can be baked in', () => {
    const offenders: string[] = [];
    for (const file of [...walk(join(repoRoot, 'src'), /\.(tsx?|ts)$/), join(repoRoot, 'index.html')]) {
      if (/import\.meta\.env|process\.env/.test(readFileSync(file, 'utf8'))) offenders.push(relative(file));
    }
    expect(offenders).toEqual([]);
  });

  it.runIf(existsSync(join(distDir, 'index.html')))(
    'serves the built page from one origin, with no third-party subresource',
    () => {
      const html = readFileSync(join(distDir, 'index.html'), 'utf8');
      const subresources = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]!);
      const remote = subresources.filter((url) => /^https?:\/\//.test(url));
      expect(remote, 'a subresource points at a third-party origin').toEqual([]);
    },
  );

  it('keeps the only outbound links on the page pointing at the upstream catalogue', () => {
    const cardSource = readFileSync(join(repoRoot, 'src/cards/registry.ts'), 'utf8');
    expect(cardSource).toContain('sourceUrl');
    const attribution = JSON.parse(readFileSync(join(repoRoot, 'attribution.json'), 'utf8')) as {
      cards: { sourceUrl: string }[];
    };
    for (const entry of attribution.cards) {
      expect(entry.sourceUrl.startsWith('https://')).toBe(true);
    }
  });
});
