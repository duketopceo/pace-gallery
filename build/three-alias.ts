/**
 * The upstream package pins two extra Three copies as aliased dependencies (`three128`,
 * `three165`) because individual items were authored against r128, r149, r155, r165, r169 and
 * r185. Every vendored item we ship touches only long-stable Three core classes, so both aliases
 * resolve to the single `three` dependency.
 *
 * `vendor/threeui/README.md` records which items forced a version we could not drop: none of them.
 * The one accepted cost is documented there and in the PR: two items assign colour-management
 * constants that Three removed in r152, which is a no-op assignment on the pinned runtime.
 *
 * Shared by the app build and the test runner so the two can never disagree about resolution.
 */
export const THREE_ALIASES = {
  three128: 'three',
  three165: 'three',
} as const;

export const DEDUPE = ['react', 'react-dom', 'three'] as const;
