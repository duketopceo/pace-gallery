import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

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

/**
 * The one place a visitor may see the vendor name: the static credit in `index.html`.
 *
 * Hard constraint 6 requires the source credit to be rendered on the page and hard constraint 7
 * forbids the vendor in the *product name*. Those are compatible only if the credit lives in the
 * body and not in the title or the heading. This helper strips the designated credit block so the
 * rest of the document can be held to the stricter rule, which is what "no branding" means for a
 * title, a meta tag or a class name.
 */
function withoutCredit(html: string): string {
  return html.replace(/<footer id="credit"[\s\S]*?<\/footer>/g, '');
}

/** The credit block must be present and must actually name the source. */
function creditBlock(html: string): string {
  return html.match(/<footer id="credit"[\s\S]*?<\/footer>/)?.[0] ?? '';
}

// These tests check the emitted bundle, not the sources. Running them without a build would be a
// false negative, so fail loudly instead.
beforeAll(() => {
  if (!existsSync(join(distDir, 'index.html')) || !existsSync(join(distDir, 'assets'))) {
    throw new Error('dist/ is missing. Run `npm run build` before `npm run test`: the branding, font and tracking tests assert against the built page.');
  }
});

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
    offenders.push(
      ...['index.html']
        .map((name) => ({ name, text: readFileSync(join(repoRoot, name), 'utf8') }))
        .filter(({ text }) => VENDOR_NAME.test(withoutCredit(text)))
        .map(({ name }) => name),
    );
    expect(offenders, 'the source licence is not a trademark licence').toEqual([]);
  });

  it('keeps the vendor name out of the built document and the built stylesheet, outside the credit', () => {
    expect(existsSync(join(distDir, 'index.html')), 'run `npm run build` first').toBe(true);
    const offenders: string[] = [];
    for (const file of walk(distDir, /\.css$/)) {
      if (VENDOR_NAME.test(readFileSync(file, 'utf8'))) offenders.push(relative(file));
    }
    const html = readFileSync(join(distDir, 'index.html'), 'utf8');
    if (VENDOR_NAME.test(withoutCredit(html))) offenders.push('dist/index.html');
    expect(
      offenders,
      'the document title, meta tags and stylesheet are the product surface; the credit belongs in the footer',
    ).toEqual([]);
  });

  it('keeps the vendor name out of the title and the heading', () => {
    const html = readFileSync(join(distDir, 'index.html'), 'utf8');
    for (const tag of ['title', 'h1', 'h2']) {
      const text = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))?.[1] ?? '';
      expect(VENDOR_NAME.test(text), `<${tag}> carries the vendor name: ${text.trim().slice(0, 80)}`).toBe(
        false,
      );
    }
  });

  it('ships the credit in the served HTML, so the notice does not depend on script execution', () => {
    // This is the obligation `scripts/check-dist.mjs` exists to protect, asserted from our side
    // too. React renders the full notice once the page hydrates, but a notice that only exists
    // after script runs is absent from the delivered document.
    const html = readFileSync(join(distDir, 'index.html'), 'utf8');
    const credit = creditBlock(html);
    expect(credit, 'the static credit block is missing from the built document').not.toBe('');
    expect(VENDOR_NAME.test(credit), 'the static credit must name the source').toBe(true);
    expect(credit).toMatch(/MIT/);
    expect(credit).toMatch(/not affiliated with,\s+endorsed\s+by, or sponsored by/i);
  });

  it('keeps the static credit a colophon, so it cannot grow into a second footer', () => {
    // The first version of this block repeated the operational claims the masthead and the rendered
    // footer already make, and in the browser it read as a second, accidental footer. The cap is the
    // regression guard: the notice obligation needs the licence facts, not the marketing copy.
    const text = creditBlock(readFileSync(join(distDir, 'index.html'), 'utf8'))
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    expect(text.length, `static credit is ${text.length} chars; keep it under 420`).toBeLessThan(420);
    expect(creditBlock(readFileSync(join(distDir, 'index.html'), 'utf8')).match(/<p>/g)?.length).toBe(1);
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
    expect(registry).toMatch(/license: attributionFile\.upstream\.license/);
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

  it('never uses a reserved font name anywhere in the built bundle', () => {
    // Scans every emitted file, not a hand-picked subset. The gap that let this ship once: the
    // notice text lives in `attribution.json`, the bundler inlines it into the *entry* chunk, and
    // the earlier version of this test scanned `card-*.js` plus the document but never the entry
    // chunk — so the word the notice was written to avoid was in the bundle, inside the notice
    // that claimed no derivative used it. An allow-list of globs is how that happens; a sweep of
    // everything under dist/ is how it stays fixed.
    //
    // Scope is `src/`, `index.html` and all of `dist/` — what ships. This file is excluded because a
    // test that asserts a string has to contain it in order to search for it.
    const offenders: string[] = [];
    for (const file of [
      ...walk(join(repoRoot, 'src'), /\.(tsx?|css|json)$/),
      join(repoRoot, 'index.html'),
      ...walk(distDir, /\.(html|css|js|mjs|json|svg|txt|xml|map)$/),
    ]) {
      if (PROVENANCE_FILES.has(relative(file)) || isVendoredUpstream(file)) continue;
      if (RESERVED_FONT_NAME.test(readFileSync(file, 'utf8'))) offenders.push(relative(file));
    }
    expect(offenders).toEqual([]);
  });

  it('records the reserved name as withheld, so the audit trail records the fact without the word', () => {
    // The obligation is auditable either way, but a record that printed the reserved name would
    // itself be a violation. The fact is kept; the string is not.
    const attribution = JSON.parse(readFileSync(join(repoRoot, 'attribution.json'), 'utf8')) as {
      thirdParty: { id: string; reservedFontNames: { reserved: boolean; usedHere: boolean; note: string }[] }[];
    };
    const fonts = attribution.thirdParty.find((entry) => entry.id === 'bundled-fonts');
    expect(fonts, 'the upstream font record is missing').toBeDefined();
    const reserved = fonts!.reservedFontNames.filter((entry) => entry.reserved);
    expect(reserved.length, 'a reserved OFL font name went unrecorded').toBeGreaterThan(0);
    for (const entry of reserved) {
      expect(entry.usedHere, 'a reserved font name is marked as used here').toBe(false);
      expect(entry.note, 'the record must explain why the name is absent').toMatch(/not printed|not reproduced/i);
    }
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
