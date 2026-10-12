# Landscape: animated component galleries

Date: 2026-10-11. Method: fetched each product's front page (links below). Claims are limited to what
the pages stated; "not stated" means the page did not say.

## Who else does this

| Project | What it is | Delivery | Licence / price | Per-component size shown |
|---|---|---|---|---|
| [React Bits](https://reactbits.dev) | Free animated React components in five categories (text, animations, components, backgrounds, micro interactions) | Copy source or CLI; JS or TS, CSS or Tailwind | Called "free"; licence not stated on the page | Not shown |
| [Aceternity UI](https://ui.aceternity.com) | React + Tailwind + Motion components for landing pages; 116+ free components, 180+ paid blocks | Copy-paste, shadcn CLI, plus an MCP server | Free tier plus paid All-Access Pass; terms not stated | Not shown |
| [Magic UI](https://magicui.design) | 150+ free open-source animated components, companion to shadcn/ui; paid Pro blocks | Browse and copy; install method not stated | Free and open source; licence not named; Pro paid | Not shown |
| Upstream source (`@designcodeio/threeui` 1.2.0, MIT; see `attribution.json`) | The WebGL and DOM components this gallery vendors | npm package | MIT | No |

## What they do better

- Breadth: 116 to 150+ components each, against 17 here.
- Install paths: CLI and copy-paste give a visitor working code in one step. This gallery is a showcase only.
- Paid tiers fund ongoing maintenance.

## What they do worse

- None of the fetched pages show what a component costs to ship. Aceternity and Magic UI are built on Tailwind plus Motion, and a visitor cannot see the JavaScript weight before copying.
- Licence terms are not stated on the front pages of two of the three.

## What users expect

Live previews, a way to get the code, and some sign of whether the component is heavy. The first two are standard in this category; the third is the gap.

## What is unique here

1. **A measured per-card byte cost printed on every card**, enforced by a 150 KiB gzip ceiling in CI (`budget.json`, `scripts/measure-bytes.mjs`).
2. A real still for every card when WebGL2 is missing or reduced motion is set.
3. A machine-checked licence trail (`attribution.json`, `tests/compliance.test.ts`) and zero third-party requests.

Trade-off: no install path and 17 cards. The gallery is a marketing asset (see README), so breadth is not the goal.

## Implication for the roadmap

Lean into the one thing nobody shows: make the byte cost the visual centre of each card (see ROADMAP U1), and do not chase breadth.
