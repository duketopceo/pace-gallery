# AGENTS.md — Pace Gallery

Inherits from [luke-agents/AGENTS.md](https://github.com/duketopceo/luke-agents/blob/main/AGENTS.md).
This file specializes; it does not replace. Cite the constitution by section number (`§5.9`,
`§8`, `§19.4`) rather than restating it.

## What this repository is

A public static component-card gallery. It is a marketing asset, not a library, not a playground,
and not part of any product interface. 17 cards, each a composable React component, each with a
measured byte cost printed on it and a source credit.

The component source is MIT-licensed and vendored under `vendor/threeui/`. Read
`vendor/threeui/README.md` before touching it: it records the allowlist, the rejection list, the
two modifications applied to the vendored source, and what the Three.js dependency trap cost.

## Stack

Vite 8, React 19, TypeScript 5.9, Three.js 0.186, Vitest 5, ESLint 9. No CSS framework. No
analytics. No runtime.

React is pinned below 20 because the upstream package's peer range is `>=18 <20`. Do not upgrade
it without re-reading that constraint.

## Commands

| Command | Use |
|---|---|
| `npm run build` | The build. Also regenerates `src/lib/card-bytes.json` from the emitted bundle. |
| `npm run verify` | What CI runs: typecheck, lint, test, build, byte budget. Offline. |
| `npm run check:claim` | Network. Asserts the **published** page ships no telemetry host, that the origin still sends a CSP whose `script-src` allows no third-party origin, and that no cookie is set. Not in `verify`, because it is the one check the build cannot do. |
| `npm run dev` | Local dev server. |
| `npm run vendor:check` | Network. Fails if `vendor/threeui/` drifted from the published tarball. |
| `npm run vendor:sync` | Network. Rewrites `vendor/threeui/` from the tarball. |

## Rules that are not obvious from the code

1. **Never edit `vendor/threeui/lib/` by hand.** It is generated. Edit
   `vendor/threeui.manifest.json` and run `npm run vendor:sync`. CI runs `vendor:check` and will
   fail on a hand edit.
2. **Never add a card whose module renders an iframe document.** 73 of the 103 upstream exports
   are a byte-exact HTML document in a sandboxed iframe. They are not components. A test fails the
   build if a vendored module grows an iframe, a `sources/` document import, or a remote URL.
3. **Never hand-edit `src/lib/card-bytes.json`.** It is generated, and `npm run build:check` fails if
   a figure moved beyond the 1024-byte cross-machine tolerance. If a card's figure looks wrong, fix
   the measurement in `scripts/measure-bytes.mjs` and rebuild. The entry chunk is measured as the
   *page shell* and is never printed on the page, because the page shell holds the report: a printed
   figure that counted its own chunk could never settle. Do not move it back into the shared-runtime
   total.
4. **Adding a card means touching four files, in this order:** `vendor/threeui.manifest.json`
   (allowlist, then `npm run vendor:sync`), `cards.json`, `attribution.json` (with a real
   `https://threeui.com/...` item page — do not invent one), `src/cards/presets.tsx` (with pinned
   props), and `src/styles.css` if it needs a new still pattern. `tests/gallery.test.ts` fails if
   the renderer, the still, the attribution record or the measurement is missing.
5. **The still is not a screenshot.** It is an authored CSS approximation, and each card's still
   says so in its accessible name. Do not describe it as a capture.
6. **Never name the vendor in the product's own voice.** The page title, the `h1`, the lede, the
   package name and the repository name carry no vendor name. Attribution goes in the credit line
   and the footer, where the licence requires it. `tests/compliance.test.ts` checks the built
   document, the built stylesheet and every card chunk, not the source intentions.
7. **Never bundle a font, and never use a reserved font name.** Upstream bundles OFL fonts, one
   with a Reserved Font Name. The `@font-face` rule is stripped at vendor time. Keep the system UI
   and monospace stacks.
8. **Never add a tracker, a cookie, client storage, or a third-party subresource.** Aggregate
   counting, if it ever happens, belongs to the hosting layer, not to this page. The build cannot
   enforce the second half of that sentence: Cloudflare Web Analytics injects
   `static.cloudflareinsights.com/beacon.min.js` into the served HTML *after* the build, so
   `dist/` stays clean and every build-side gate stays green while the published page ships a
   third-party script tag. `tests/compliance.test.ts` covers the artefact;
   `npm run check:claim` covers the response. Run the second one after any origin, DNS, hosting or
   Cloudflare change, and any time someone proposes relaxing `script-src`.
9. **Do not put the vendor's Three.js aliases back.** `build/three-alias.ts` maps `three128` and
   `three165` to the single `three` dependency and is shared by the app build and the test runner.
   Add a card to the build with a new Three API only after checking it is not a removed one.

## Known accepted costs

- Two vendored items assign `renderer.outputEncoding` with `LinearEncoding` / `sRGBEncoding`,
  constants Three removed in r152. On the pinned runtime the assignment is a no-op and the
  renderer keeps its default sRGB output. The build prints a warning for each. The warnings are
  deliberately left visible; do not silence them without recording why.
- The shared runtime figure is ~212 KiB gzipped, dominated by Three.js at ~139 KiB. It is a page
  cost, reported once, and is not charged to any card.
- The bundler's minifier is a platform-specific native binary, so a card figure can move by a few
  hundred bytes between macOS and Linux. The gate allows 1024 bytes of drift and prints a warning
  when it uses that allowance. Over budget is always a hard fail.
- The vendored modules are minified: upstream publishes no original source and no `.js.map` files.
  The type declarations are what make them reviewable.

## Local convention

One class component exists, in `src/components/RenderBoundary.tsx`. React has no hook API for
error boundaries and a public marketing asset that white-screens because a third-party scene threw
is a worse outcome than one class in the tree. It is documented there. Do not add another without
the same argument.
