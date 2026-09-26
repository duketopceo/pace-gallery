// Copy the canonical attribution record into the build output.
//
// Hard constraint 5 puts `attribution.json` in the repository root, which is where a reader or an
// auditor looks for it. The deploy gate looks for it in the build output instead, because the
// gate can only inspect what would actually be published. Vite copies `public/` into `dist/` and
// nothing else, so the file is emitted here rather than by being moved into `public/` and
// duplicated: one canonical copy at the root, copied verbatim on every build.
//
// Fails the build if `dist/` is missing, so a mis-ordered `build` cannot quietly ship a page whose
// licence record is absent.

import { copyFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SOURCE = join(ROOT, 'attribution.json');
const DIST = join(ROOT, 'dist');
const TARGET = join(DIST, 'attribution.json');

const exists = async (path) => {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
};

async function main() {
  if (!(await exists(DIST))) {
    console.error('FAIL: dist/ is missing. Run the bundler before this script.');
    process.exit(1);
  }
  if (!(await exists(SOURCE))) {
    console.error(`FAIL: ${SOURCE} is missing; the licence record has no source copy.`);
    process.exit(1);
  }

  await copyFile(SOURCE, TARGET);
  const { size } = await stat(TARGET);
  console.log(`emitted dist/attribution.json (${size} bytes, copied from the repository root)`);
}

await main();
