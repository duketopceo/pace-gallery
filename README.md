# Pace Gallery

A public, static grid of authored WebGL and DOM component cards. Every card shows a live render
(or a real still when it cannot have one), a one-line description, **its own measured JavaScript
byte cost**, and a source credit line.

This is a marketing asset. It is not a component library, not a demo playground, and not part of
any product interface. There is no runtime, no database, no analytics script and no cookie.

Component source is `@designcodeio/threeui` v1.2.0, MIT licensed. See
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [attribution.json](attribution.json).

## Build

```
npm ci
npm run build
```

That is the one command. It runs `vite build` and then measures the emitted bundle, and it needs
no network access after `npm ci` — the component source is committed under
[`vendor/threeui/`](vendor/threeui/README.md), and nothing in the build contacts the vendor.

To develop: `npm run dev`. To serve the built output: `npm run preview`.

Full gate, which is what CI runs:

```
npm run verify     # typecheck, lint, test, build, and the byte budget
```

| Command | What it does |
|---|---|
| `npm run build` | Build the site and regenerate `src/lib/card-bytes.json` from the emitted bundle. |
| `npm run build:check` | Same, but fails if any card is over budget or the committed figures are stale. |
| `npm run budget` | Re-measure the existing `dist/` and enforce the per-card ceiling. |
| `npm run vendor:sync` | Re-download the upstream tarball and rewrite `vendor/threeui/`. |
| `npm run vendor:check` | Fail if `vendor/threeui/` has drifted from the published tarball. |

## The per-card byte budget

No vendor publishes per-component sizes, so this repository owns the measurement.

**Ceiling: 150 KiB gzipped per card** ([`budget.json`](budget.json)). A card's cost is:

- its own JavaScript chunk, gzipped, after tree-shaking; plus
- the raw byte size of any binary asset that chunk references.

Shared runtime (React, Three.js, the page stylesheet) is measured and reported **once at page
level** and is never charged to a single card, because no single card causes it.

Sourcemaps and the HTML document are excluded: a browser does not fetch a sourcemap, and the
document is a page cost rather than a card cost.

The gate is `scripts/measure-bytes.mjs`. It fails the build when a card is over the ceiling, when
a card has no chunk, when a card references an asset that was never emitted, or when
`cards.json` and `attribution.json` disagree about which cards exist. It also refuses to let the
page print figures that no longer match the bundle: `src/lib/card-bytes.json` is committed, CI
rebuilds and fails if the build would change it.

Each card's build also lands in its own chunk, which is what makes the per-card number real rather
than an estimate. `vite.config.ts` declares one chunk group per vendored component directory, with
explicit priorities — without them the bundler folds a shared dependency into whichever card chunk
reaches it first, which is how a 562 KiB Three.js build ends up attributed to a 1 KiB card.

## The byte budget in practice

Every card in this catalogue is a procedural shader or DOM component, so **every card's texture
cost is 0 bytes** and the JavaScript figure is the whole cost. The page prints `0 B assets` rather
than hiding the field, because a zero is a measurement and a blank is not.

The heaviest card is `temple-night` at ~21 KiB gzipped. The lightest is `lumen-cta` at ~0.5 KiB.
The 150 KiB ceiling is a regression gate, not a tuning target: nothing here is near it.

## Accessibility and fallbacks

Every card has a still, and every card uses the same one, for three reasons:

1. `prefers-reduced-motion: reduce` — the still replaces the scene. The vendor treats this as
   advice; this gallery treats it as a switch. Verified: 0 live scenes, 17 stills, 0 canvases.
2. No WebGL2 context. Three.js r163 dropped WebGL1, so the test is for **WebGL2**, not WebGL.
   Verified: 13 stills, and the 4 cards that do not need a GPU still render live.
3. The card has not been scrolled into view, so nothing mounts until it is worth mounting.

The still is CSS only, ships no extra bytes, and is static in all three cases. It is an **authored
approximation of the component, not a screenshot of it** — each card's still says so in its
accessible name. `tests/` pins that every card has one.

`prefers-reduced-motion` also collapses the page's own CSS transitions.

## Repository map

| Path | What it is |
|---|---|
| [`cards.json`](cards.json) | Single source of truth for the card list. Read by the build, the byte gate, the page and the tests. |
| [`attribution.json`](attribution.json) | The auditable MIT notice-retention record: every card mapped to its source page, licence and any item-specific notice. |
| [`budget.json`](budget.json) | The per-card ceiling and exactly what the measurement counts. |
| `src/cards/registry.ts` | Typed view over `cards.json` and `attribution.json`. |
| `src/cards/presets.tsx` | One pinned-prop live element per card. |
| `src/components/CardStage.tsx` | The live-or-still decision, per card. |
| `src/lib/card-bytes.json` | Generated. The figures the page prints. Never hand-edited. |
| `vendor/threeui/` | Committed component source, its licences, and the full rationale. |
| `scripts/` | Vendor sync, the static build loop, and the byte gate. |

## Licence position

- This repository's own code: MIT ([LICENSE](LICENSE)).
- Redistributed component source: MIT, `Copyright (c) 2026 Meng To`, notice reproduced in full in
  [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and rendered in the page footer.
- The vendored source carries two documented mechanical modifications, declared in
  `vendor/threeui.manifest.json` and re-verified by `npm run vendor:check`.
- This is a source licence, not a trademark licence. The gallery is not affiliated with, endorsed
  by or sponsored by the upstream project, and it is not named after it.
- No font is bundled and no font licence is owed. Upstream inlines an OFL font in its stylesheet;
  that `@font-face` rule is stripped at vendor time.

`tests/compliance.test.ts` enforces the branding, font and tracking rules against the built output
rather than against intentions.
