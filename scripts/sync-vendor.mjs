#!/usr/bin/env node
/**
 * Vendors the allowlisted subset of `@designcodeio/threeui` into `vendor/threeui/`.
 *
 * This is a maintenance command, never part of `npm run build`. The build reads the
 * committed tree only, so a clean clone builds offline and never contacts the vendor.
 *
 *   node scripts/sync-vendor.mjs           # write vendor/threeui/ from the npm tarball
 *   node scripts/sync-vendor.mjs --check   # fail if the committed tree drifts from the tarball
 */
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, rm, readdir, stat } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = join(repoRoot, 'vendor', 'threeui.manifest.json');
const outDir = join(repoRoot, 'vendor', 'threeui');
const checkOnly = process.argv.includes('--check');

/** Minimal gzip tar reader. Avoids a dependency for a 40 MB one-shot maintenance task. */
function extractTarGz(buffer) {
  const tar = gunzipSync(buffer);
  const files = new Map();
  let offset = 0;
  let longName = null;
  while (offset + 512 <= tar.length) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const rawName = readString(header, 0, 100);
    const size = parseInt(readString(header, 124, 12).trim() || '0', 8);
    const type = String.fromCharCode(header[156]);
    const prefix = readString(header, 345, 155);
    const name = longName ?? (prefix ? `${prefix}/${rawName}` : rawName);
    longName = null;
    const body = tar.subarray(offset + 512, offset + 512 + size);
    offset += 512 + Math.ceil(size / 512) * 512;
    if (type === 'L') {
      longName = body.toString('utf8').replace(/\0+$/, '');
      continue;
    }
    if (type === '0' || type === '\0') files.set(name, body);
  }
  return files;
}

function readString(buffer, start, length) {
  const slice = buffer.subarray(start, start + length);
  const end = slice.indexOf(0);
  return slice.subarray(0, end === -1 ? slice.length : end).toString('utf8');
}

async function listFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listFiles(full)));
    else out.push(full);
  }
  return out.sort();
}

async function main() {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const response = await fetch(manifest.tarball);
  if (!response.ok) throw new Error(`tarball fetch failed: HTTP ${response.status}`);
  const tarball = Buffer.from(await response.arrayBuffer());

  const actualIntegrity = `sha512-${createHash('sha512').update(tarball).digest('base64')}`;
  if (actualIntegrity !== manifest.tarballIntegrity) {
    throw new Error(
      `integrity mismatch for ${manifest.package}@${manifest.version}\n` +
        `  expected ${manifest.tarballIntegrity}\n  actual   ${actualIntegrity}`,
    );
  }

  const entries = extractTarGz(tarball);
  const renames = manifest.renameTokens ?? [];
  const strips = (manifest.stripPatterns ?? []).map(([pattern, replacement]) => [
    new RegExp(pattern, 'g'),
    replacement,
  ]);
  const applyRenames = (text) => {
    let out = text;
    for (const [from, to] of renames) out = out.split(from).join(to);
    for (const [pattern, replacement] of strips) out = out.replace(pattern, replacement);
    return out;
  };
  const take = (tarPath) => {
    const body = entries.get(tarPath);
    if (body === undefined) return undefined;
    if (!/\.(js|mjs|cjs|css|ts|tsx|json|html)$/.test(tarPath)) return body;
    return Buffer.from(applyRenames(body.toString('utf8')), 'utf8');
  };
  const wanted = new Map();
  for (const file of manifest.licenseFiles) wanted.set(file, take(`package/${file}`));
  for (const file of manifest.styleSheets) {
    wanted.set(`lib/${basename(file)}`, take(`package/${file}`));
  }
  for (const dir of manifest.moduleDirs) {
    const prefix = `package/${dir}/`;
    for (const name of entries.keys()) {
      if (name.startsWith(prefix) && !name.endsWith('/')) {
        wanted.set(join('lib', basename(dir), name.slice(prefix.length)), take(name));
      }
    }
  }

  const missing = [];
  for (const key of wanted.keys()) {
    if (!wanted.get(key)) missing.push(key);
  }
  if (missing.length > 0) throw new Error(`missing from tarball:\n  ${missing.join('\n  ')}`);

  if (checkOnly) {
    const onDisk = new Set(
      (await listFiles(outDir)).map((file) => relative(outDir, file).split('\\').join('/')),
    );
    const expected = new Set([...wanted.keys(), 'README.md', 'SOURCE.json']);
    const drift = [];
    for (const key of wanted.keys()) {
      const full = join(outDir, key);
      if (!onDisk.has(key)) {
        drift.push(`missing: ${key}`);
        continue;
      }
      const disk = await readFile(full);
      if (!disk.equals(wanted.get(key))) drift.push(`differs: ${key}`);
    }
    for (const key of onDisk) {
      if (!expected.has(key)) drift.push(`unexpected: ${key}`);
    }
    if (drift.length > 0) {
      console.error('vendor tree drifted from the tarball:\n  ' + drift.join('\n  '));
      process.exitCode = 1;
      return;
    }
    console.log(`vendor tree matches ${manifest.package}@${manifest.version} (${wanted.size} files)`);
    return;
  }

  await rm(outDir, { recursive: true, force: true });
  for (const [key, body] of wanted) {
    const full = join(outDir, key);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, body);
  }

  const source = {
    package: manifest.package,
    version: manifest.version,
    tarball: manifest.tarball,
    tarballIntegrity: manifest.tarballIntegrity,
    license: 'MIT',
    copyright: 'Copyright (c) 2026 Meng To',
    renamedTokens: renames.map(([from, to]) => ({ from, to })),
    strippedPatterns: (manifest.stripPatterns ?? []).map(([pattern]) => pattern),
    vendoredFiles: wanted.size,
    vendoredBytes: [...wanted.values()].reduce((total, body) => total + body.byteLength, 0),
  };
  await writeFile(join(outDir, 'SOURCE.json'), `${JSON.stringify(source, null, 2)}\n`);

  const totalBytes = (await Promise.all((await listFiles(outDir)).map(async (f) => (await stat(f)).size))).reduce(
    (a, b) => a + b,
    0,
  );
  console.log(
    `vendored ${wanted.size} files (${(totalBytes / 1024).toFixed(1)} KiB) from ${manifest.package}@${manifest.version}`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
