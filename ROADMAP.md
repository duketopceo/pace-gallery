# Roadmap

Program-level plan, written 2026-10-11 directly (the `ce-plan` skill was not run: this is a small static repo and the
brief's required fields are all here). Evidence: `docs/research/2026-10-10-landscape.md`, `DESIGN.md`.
Open PR #6 (no-analytics claim check) is independent and touches `README.md`, `AGENTS.md`, `package.json`,
`scripts/check-claim.mjs`; expect a trivial README rebase.

## Now

### U1. Byte meter on the card face (tick rail)
- **Status**: not started. **Evidence**: landscape table, no competitor shows cost.
- **Goal**: replace the two text readouts with a thin 60-tick rail where lit ticks = share of the 150 KiB ceiling; numbers stay in mono.
- **Difficulty**: easy. Pure CSS and `Card.tsx`; data is already in `card-bytes.json`.
- **Feasibility**: no blockers. Ticks must encode data (DESIGN.md rule), so ticks are computed, not decorative. Most cards use under 3% of budget, so the rail will be near empty; use a log scale or label it honestly.
- **Simpler alternative**: a single `<meter>` element with the same data. Less distinctive, zero custom CSS.
- **Dependencies**: none. **Verify**: vitest, screenshot, `npm run build:check`.

### U2. Stop-to-go reveal for stage mounting
- **Status**: not started.
- **Goal**: when a card scrolls in, hold the still, then swap to live in 160 ms. No spinner.
- **Difficulty**: easy. `CardStage.tsx` only; must respect `prefers-reduced-motion` (already global).
- **Feasibility**: none. **Simpler alternative**: do nothing; the existing opacity transition already exists.
- **Verify**: reduced-motion test still shows 0 canvases.

### U3. Reconcile `card-bytes.json` drift
- **Status**: observed. On this machine `build:check` exits 0 yet rewrites `src/lib/card-bytes.json` (shared runtime 224940 vs 226233). 
- **Goal**: make the figures reproducible across machines, or have the check tolerate a documented epsilon.
- **Difficulty**: medium. Gzip and bundler output depend on the toolchain versions.
- **Feasibility**: may be inherent to platform differences in the bundler; pin or document.
- **Simpler alternative**: stop committing the file and generate it at build only. This removes `src/lib/card-bytes.json` and the "committed figures are stale" check in `scripts/measure-bytes.mjs`.

## Next

### U4. Self-host Mona Sans and Monaspace Neon
- **Difficulty**: medium. Needs WOFF2 subsets, `@font-face`, and a size-adjusted fallback.
- **Feasibility**: OFL licences must be added to `THIRD_PARTY_NOTICES.md`; `tests/compliance.test.ts` currently asserts "no `@font-face`" and a system stack, so the test and the "No fonts are bundled" footer sentence change with it. Adds font bytes to a page that brags about bytes.
- **Simpler alternative**: keep the system stack (current state). Recommended unless brand parity with the Pace product is needed.

### U5. Sort and filter by byte cost
- **Difficulty**: medium. Needs client state, and must not use `localStorage` (compliance test).
- **Feasibility**: fine with in-memory state. **Simpler alternative**: sort the static `CATEGORIES` groups by bytes at build time; no interactivity.

### U6. Real stills from the live scenes
- **Difficulty**: hard. Needs a headless WebGL2 capture step in the build and committed images; every image adds asset bytes that count against the card budget.
- **Feasibility**: headless GPU capture is flaky; software GL output differs between machines.
- **Simpler alternative**: keep the CSS stills and delete the least convincing patterns.

## Later

### U7. Install snippet per card
- **Difficulty**: medium. Needs a copyable import path into the vendored tree.
- **Feasibility**: the vendor licence is MIT but the vendoring has two documented modifications; the snippet must not imply the gallery is a library (AGENTS.md rule).
- **Simpler alternative**: link each card to the source page it already links to.

### U8. Simplify the stills
- **Difficulty**: easy. **Feasibility**: none.
- **Simpler alternative / deletion target**: `src/styles.css` holds ~16 `.card-still[data-pattern=...]` blocks (about 250 lines) with glows and box-shadows that Master Clock forbids elsewhere. Collapse to 4 to 5 shared patterns, or drop glow shadows. This is the biggest simplification found.
