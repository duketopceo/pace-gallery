# Design: Master Clock, applied to the gallery

Direction: **Master Clock** (Pace v5), governing doc `Pace-Server/DESIGN.md` (ratified 2026-10-04). Tokens source of
truth: Pace-Server `brand/tokens.json`. This file only records how the gallery applies them.

**Scope note.** Pace-Server decision Q6 says `pace-gallery` is a separate lab property outside the Master Clock lock.
This file adopts the direction anyway, per the program brief, for the page chrome only. The card stages (the
shader and DOM scenes) are content, not chrome, and keep their own colour. Revert is one file (`src/styles.css`).

## Reference lock (inherited)
Swiss railway clock: porcelain face, graphite marks, one signal colour. Signal is for the primary action, "now",
the focus ring and the mark disc, never a wash or status. Mono only for readouts. Shadows for overlays only.

## Tokens used

| Token | Light | Dark | Role here |
|---|---|---|---|
| canvas | `#F3F4F3` | `#0F1112` | page |
| surface | `#FCFCFB` | `#16191B` | card body |
| hairline | `#DCDFDF` | `#2A2F33` | card and section edges |
| ink | `#16181A` | `#ECEDEC` | titles, byte readouts |
| ink-2 | `#3D4247` | `#B4BABE` | body copy |
| ink-3 | `#5E656B` | `#8C9398` | metadata (smallest text colour) |
| signal / signal-text | `#D33C11` / `#B7350F` | `#FF6A3D` | focus ring, links, mark disc |

Contrast (from the Pace spec, same values): ink-3 on surface 5.8:1 light, 5.7:1 dark; signal-text on surface 5.8:1
light, 6.2:1 dark. Dark theme follows `prefers-color-scheme` only. There is no toggle, because the page may not
use client storage.

## Type
System sans stack (a compliance test pins it). Titles 18/600, -0.02em. Readouts (byte counts, counts, stat
values) use the system monospace with tabular figures. Mona Sans and Monaspace Neon are the target; see ROADMAP U4.
No uppercase tracked labels.

## Shape, elevation, motion
Radius 4 (controls, focus ring), 6 (cards). Hairline borders, no shadow on cards, no backdrop blur. Motion is 90 ms
ease-out `cubic-bezier(0.2,0,0,1)`; `prefers-reduced-motion` collapses all of it. Focus ring: 2 px surface gap then
2 px signal, on `:focus-visible`.

## Grid
Cards `minmax(340px, 1fr)`, gap 20 px, single column below 520 px. Card order: stage, title + cost, description, credit.

## Surfaces
One web page (masthead, grouped card grid, credit footer) and the README.

## Decision ledger
| Decision | Why |
|---|---|
| Light by default, dark via system | Master Clock day and night dial; stage content stays dark in both so scenes read the same |
| Mint accent removed | One signal colour only; mint was a second chromatic accent |
| Byte readouts in ink, not accent | Mono is for readouts; colour is reserved for signal |
| Logo reused, not drawn | Existing interim Pace mark; see `assets/brand/README.md`. Owner signs off any replacement |

## Known gaps
Stills still use glow box-shadows and gradients inside the stage (content, but off-voice); see ROADMAP U8.
