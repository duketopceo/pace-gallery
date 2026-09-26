#!/usr/bin/env node
/**
 * The one documented build command.
 *
 * The page prints its own measured byte cost, so the bundle contains the measurement and the
 * measurement is taken from the bundle. That is a fixed point, not a loop bug: the entry chunk
 * embeds the figures, so its own size shifts the page-level number by a few dozen bytes. This
 * script iterates `vite build` and `measure-bytes.mjs --write` until the report stops changing,
 * then proves the result is self-consistent.
 *
 * `npm run build:check` is the same loop with a `--check` gate at the end, for CI.
 */
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reportPath = join(repoRoot, 'src', 'lib', 'card-bytes.json');
const checkOnly = process.argv.includes('--check');
const MAX_PASSES = 6;

function run(command, args) {
  const result = spawnSync(command, args, { cwd: repoRoot, stdio: 'inherit', shell: false });
  if (result.status !== 0) {
    console.error(`${command} ${args.join(' ')} failed with exit code ${result.status}`);
    process.exit(result.status ?? 1);
  }
}

async function readReport() {
  try {
    return await readFile(reportPath, 'utf8');
  } catch {
    return null;
  }
}

let previous = await readReport();
for (let pass = 1; pass <= MAX_PASSES; pass += 1) {
  console.log(`\nbuild pass ${pass}/${MAX_PASSES}`);
  run('npx', ['vite', 'build']);
  run('node', ['scripts/measure-bytes.mjs', '--write']);
  const current = await readReport();
  if (current === previous) {
    console.log(`byte report is stable after ${pass} pass(es)`);
    if (checkOnly) {
      run('node', ['scripts/measure-bytes.mjs', '--check']);
    }
    process.exit(0);
  }
  previous = current;
}

console.error(
  `byte report did not settle after ${MAX_PASSES} passes. Something in the build is not deterministic.`,
);
process.exit(1);
