// Deploy gate for the component card gallery.
//
// This is a licence-compliance and asset-integrity gate, not a linter. It fails
// the deploy when the build would ship something the licence forbids or the site
// would be broken, so the obligations in DUK-77 "Hard constraints" are enforced by
// the pipeline rather than by a reviewer's memory.
//
// Checks, in order:
//   1. dist/index.html exists
//   2. Every local asset reference in index.html resolves inside dist/
//   3. No credential-shaped string anywhere in dist/
//   4. The product name (title, h1) carries no vendor name        (constraint 7)
//   5. A visible source credit is rendered on the page             (constraint 6)
//   6. The string "Lexend" appears nowhere in dist/                (constraint 6,
//      Lexend is OFL 1.1 with a Reserved Font Name)
//   7. attribution.json exists, is valid, every card carries a sourceUrl and a
//      licence, and the card count meets minCards                 (constraint 5)
//
// Usage: node scripts/check-dist.mjs [distDir]

import { readdir, readFile, stat } from 'node:fs/promises'
import { join, posix } from 'node:path'

const DIST = (process.argv[2] || new URL('../dist/', import.meta.url).pathname).replace(/\/$/, '')

const VENDOR = /three\s*ui|designcode/i
const CREDIT = /three\s*ui|designcode/i
const RESERVED_FONT = /Lexend/i
const SECRET = [
  /gh[pousr]_[A-Za-z0-9]{20,}/, // GitHub tokens
  /sk-[A-Za-z0-9]{20,}/, // OpenAI-style keys
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /AKIA[0-9A-Z]{16}/, // AWS access key id
  /Bearer\s+[A-Za-z0-9._-]{30,}/,
]

const failures = []
const fail = (m) => failures.push(m)

async function walk(dir) {
  const out = []
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name)
    if (e.isDirectory()) out.push(...(await walk(full)))
    else out.push(full)
  }
  return out
}

const exists = async (p) => {
  try {
    await stat(p)
    return true
  } catch {
    return false
  }
}

async function main() {
  if (!(await exists(DIST))) {
    console.error(`FAIL: no build output at ${DIST}. Run \`npm run build\` first.`)
    process.exit(1)
  }

  const files = await walk(DIST)
  const rel = (f) => f.slice(DIST.length + 1).split(/[\\/]/).join('/')

  // 1. entrypoint
  const indexPath = join(DIST, 'index.html')
  if (!(await exists(indexPath))) fail('dist/index.html is missing')
  const index = (await exists(indexPath)) ? await readFile(indexPath, 'utf8') : ''

  // 2. local references resolve
  const refs = [
    ...index.matchAll(/\b(?:href|src)="([^"#?]+)"/g),
  ]
    .map((m) => m[1])
    .filter((u) => !/^([a-z]+:)?\/\//i.test(u) && !u.startsWith('data:') && !u.startsWith('mailto:'))
  for (const ref of new Set(refs)) {
    const target = join(DIST, ref.replace(/^\//, ''))
    if (!(await exists(target))) fail(`index.html references missing local file: ${ref}`)
  }

  // 3-4-6. scan every shipped file
  for (const f of files) {
    if (!/\.(html|css|js|mjs|json|svg|txt|xml)$/.test(f)) continue
    const body = await readFile(f, 'utf8')
    const name = rel(f)
    for (const [i, re] of SECRET.entries()) {
      if (re.test(body)) fail(`possible credential in ${name} (pattern ${i + 1})`)
    }
    if (RESERVED_FONT.test(body)) {
      fail(`"Lexend" appears in ${name}: OFL 1.1 Reserved Font Name, no derivative may use the word`)
    }
  }

  // 4. product name carries no vendor name
  const title = index.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ''
  const h1 = index.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? ''
  if (VENDOR.test(title)) fail(`<title> contains the vendor name: ${title.trim().slice(0, 80)}`)
  if (VENDOR.test(h1)) fail(`<h1> contains the vendor name: ${h1.trim().slice(0, 80)}`)

  // 5. visible credit on the page
  if (!CREDIT.test(index)) {
    fail('index.html renders no source credit; the MIT notice-retention obligation is unmet')
  }

  // 7. attribution.json
  const attrPath = join(DIST, 'attribution.json')
  if (!(await exists(attrPath))) {
    fail('dist/attribution.json is missing; the licence obligation is not auditable')
  } else {
    let attr
    try {
      attr = JSON.parse(await readFile(attrPath, 'utf8'))
    } catch (e) {
      fail(`attribution.json is not valid JSON: ${e.message}`)
    }
    if (attr) {
      const cards = Array.isArray(attr.cards) ? attr.cards : null
      if (!cards) fail('attribution.json has no "cards" array')
      else {
        for (const c of cards) {
          if (!c.id) fail('attribution.json: a card has no id')
          if (!c.sourceUrl || !/^https:\/\//.test(c.sourceUrl)) {
            fail(`attribution.json: card ${c.id} has no https sourceUrl`)
          }
          if (!c.license) fail(`attribution.json: card ${c.id} has no license field`)
        }
        const min = Number.isInteger(attr.minCards) ? attr.minCards : 0
        if (cards.length < min) {
          fail(`attribution.json declares minCards=${min} but only ${cards.length} cards are recorded`)
        }
      }
    }
  }

  if (failures.length) {
    console.error(`deploy gate FAILED (${failures.length}):`)
    for (const f of failures) console.error(`  - ${f}`)
    process.exit(1)
  }
  console.log(`deploy gate PASSED: ${files.length} files, index.html references resolve, licence obligations met`)
}

await main()
