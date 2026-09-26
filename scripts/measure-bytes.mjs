#!/usr/bin/env node
/**
 * Measures per-card byte cost from the emitted bundle and enforces the per-card budget.
 *
 * No vendor publishes per-component sizes, so this measurement is the whole point of the gate.
 * A card's cost is the gzipped size of its own JavaScript chunk plus the raw size of any binary
 * asset that chunk references. Shared runtime (React, Three.js, shared vendor modules) is
 * reported once at page level and is never charged to a single card, because no single card
 * causes it. See budget.json for exactly what is counted and what is not.
 *
 *   node scripts/measure-bytes.mjs --write   # measure, write src/lib/card-bytes.json
 *   node scripts/measure-bytes.mjs --check   # measure, fail on budget or on a stale report
 */
import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(repoRoot, 'dist');
const assetsDir = join(distDir, 'assets');
const reportPath = join(repoRoot, 'src', 'lib', 'card-bytes.json');
const mode = process.argv.includes('--check') ? 'check' : 'write';

/** Largest per-card movement between build machines that is not treated as a stale report. */
const TOLERANCE = 1024;

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

/** The subset of each chunk that belongs to a card, minus import statements pointing at shared chunks. */
function attributedBytes(source) {
  const withoutImports = source.replace(/^import[^;]*;$/gm, '');
  const withoutSourcemap = withoutSourcemapComment(withoutImports);
  return Buffer.from(withoutSourcemap, 'utf8');
}

function withoutSourcemapComment(source) {
  return source.replace(/\/\/# sourceMappingURL=.*$/gm, '');
}

function referencedAssets(source) {
  const found = new Set();
  for (const match of source.matchAll(/["'`]([^"'`]+?\.(?:png|jpe?g|webp|avif|gif|svg|hdr|exr|ktx2|basis|glb|gltf|bin|woff2?|ttf|otf|mp4|webm))["'`]/gi)) {
    const ref = match[1];
    if (ref.startsWith('data:')) continue;
    found.add(basename(ref));
  }
  return [...found];
}

async function main() {
  const manifest = await readJson(join(repoRoot, 'cards.json'));
  const budget = await readJson(join(repoRoot, 'budget.json'));
  const attribution = await readJson(join(repoRoot, 'attribution.json'));

  let emitted;
  try {
    emitted = await readdir(assetsDir);
  } catch {
    throw new Error('dist/assets not found. Run `npm run build:check` or `npm run build` first.');
  }

  const chunkByCard = new Map();
  const sharedChunks = [];
  for (const file of emitted) {
    if (!file.endsWith('.js')) continue;
    if (file.startsWith('card-')) chunkByCard.set(file.slice('card-'.length).replace(/-[A-Za-z0-9_-]{8}\.js$/, ''), file);
    else sharedChunks.push(file);
  }

  const cards = {};
  const failures = [];
  const rows = [];

  for (const card of manifest.cards) {
    const chunkFile = chunkByCard.get(card.id);
    if (!chunkFile) {
      failures.push(`${card.id}: no chunk named card-${card.id}-*.js in dist/assets`);
      continue;
    }
    const full = join(assetsDir, chunkFile);
    const source = await readFile(full, 'utf8');
    const jsGzip = gzipSync(attributedBytes(source), { level: 9 }).byteLength;

    let assetBytes = 0;
    for (const name of referencedAssets(source)) {
      const assetPath = join(assetsDir, name);
      try {
        assetBytes += (await stat(assetPath)).size;
      } catch {
        failures.push(`${card.id}: references asset "${name}" which was not emitted`);
      }
    }

    const total = jsGzip + assetBytes;
    cards[card.id] = { jsGzip, assetBytes, total, chunk: chunkFile };
    if (total > budget.perCardGzipBytes) {
      failures.push(
        `${card.id}: ${(total / 1024).toFixed(1)} KiB exceeds the ${(budget.perCardGzipBytes / 1024).toFixed(0)} KiB per-card budget`,
      );
    }
    rows.push({ id: card.id, jsGzip, assetBytes, total });
  }

  // Shared runtime is React, Three.js, shared vendor modules and the page stylesheet: the cost a
  // visitor pays once. The page shell (the entry chunk) is measured too, but deliberately NOT
  // included in the printed figure: the page shell contains the report, so a figure that counted
  // its own chunk could never settle.
  let sharedRuntimeGzip = 0;
  let pageShellGzip = 0;
  for (const file of sharedChunks) {
    const source = await readFile(join(assetsDir, file), 'utf8');
    const gz = gzipSync(attributedBytes(source), { level: 9 }).byteLength;
    if (/^index-.*\.js$/.test(file)) pageShellGzip = gz;
    else sharedRuntimeGzip += gz;
  }
  for (const file of emitted) {
    if (file.endsWith('.css')) {
      sharedRuntimeGzip += gzipSync(await readFile(join(assetsDir, file)), { level: 9 }).byteLength;
    }
  }

  const attributed = new Set(manifest.cards.map((card) => card.id));
  const attributedRecords = new Set(attribution.cards.map((entry) => entry.id));
  for (const id of attributed) {
    if (!attributedRecords.has(id)) failures.push(`${id}: present in cards.json but absent from attribution.json`);
  }
  for (const id of attributedRecords) {
    if (!attributed.has(id)) failures.push(`${id}: present in attribution.json but absent from cards.json`);
  }

  const report = {
    $comment:
      'Generated by scripts/measure-bytes.mjs from the emitted bundle. Do not hand-edit. Re-run `npm run build`.',
    sourcePackage: manifest.sourcePackage,
    budgetPerCardGzipBytes: budget.perCardGzipBytes,
    sharedRuntimeGzip,
    pageShellGzip,
    cardCount: manifest.cards.length,
    cards: Object.fromEntries(
      Object.entries(cards).map(([id, value]) => [id, { jsGzip: value.jsGzip, assetBytes: value.assetBytes }]),
    ),
  };

  if (failures.length > 0) {
    console.error('byte budget gate failed:\n  ' + failures.join('\n  '));
    process.exitCode = 1;
    return;
  }

  if (mode === 'check') {
    let previous = null;
    try {
      previous = await readJson(reportPath);
    } catch {
      console.error(
        `src/lib/card-bytes.json is missing. The card byte figures printed on the page would be absent.\n` +
          `Run \`npm run build\` to generate it.`,
      );
      process.exitCode = 1;
      return;
    }
    const stale = [];
    const drifted = [];
    if (previous.budgetPerCardGzipBytes !== report.budgetPerCardGzipBytes) stale.push('budget ceiling changed');
    for (const [id, value] of Object.entries(report.cards)) {
      const before = previous.cards?.[id];
      if (!before) {
        stale.push(`${id}: no recorded figure`);
        continue;
      }
      // The minifier ships a platform-specific native binary, so a card can move by a few dozen
      // bytes between a macOS build machine and a Linux one. Over budget is a hard fail; drift
      // inside the tolerance is reported and does not fail the build.
      const delta = Math.abs(value.jsGzip - before.jsGzip) + Math.abs(value.assetBytes - before.assetBytes);
      if (delta === 0) continue;
      if (delta <= TOLERANCE) drifted.push(`${id}: moved ${delta} B (${before.jsGzip} -> ${value.jsGzip})`);
      else stale.push(`${id}: recorded ${before.jsGzip}+${before.assetBytes}, measured ${value.jsGzip}+${value.assetBytes}`);
    }
    if (stale.length > 0) {
      console.error(
        'src/lib/card-bytes.json is stale, so the page would print figures that no longer match the bundle:\n  ' +
          stale.join('\n  ') +
          '\nRun `npm run build` and commit the result.',
      );
      process.exitCode = 1;
      return;
    }
    for (const line of drifted) console.warn(`within tolerance, not failing: ${line}`);
  } else {
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  }

  const kib = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`;
  rows.sort((a, b) => b.total - a.total);
  console.log(`per-card byte cost, gzipped, from the emitted bundle (budget ${kib(budget.perCardGzipBytes)}):`);
  for (const row of rows) {
    const bar = '#'.repeat(Math.max(1, Math.round(row.total / 1024)));
    console.log(
      `  ${row.id.padEnd(22)} ${kib(row.jsGzip).padStart(9)} js  ${kib(row.assetBytes).padStart(8)} assets  ${bar}`,
    );
  }
  console.log(`  ${'shared runtime'.padEnd(22)} ${kib(sharedRuntimeGzip).padStart(9)} (page level, not charged per card)`);
  console.log(`  ${'page shell'.padEnd(22)} ${kib(pageShellGzip).padStart(9)} (entry chunk; holds the report, so it is never printed on the page)`);
  console.log(`  ${'total per-card'.padEnd(22)} ${kib(rows.reduce((sum, row) => sum + row.total, 0)).padStart(9)}`);
  if (mode === 'write') console.log(`wrote ${reportPath.replace(`${repoRoot}/`, '')}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
