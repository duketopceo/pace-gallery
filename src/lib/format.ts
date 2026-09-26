const KIB = 1024;

/**
 * Byte figures are printed on the cards, so this has to be right for a 0-byte card and for a
 * 200 KiB one. It was wrong once: a 20 KiB figure printed as 0.2 KiB. `tests/format.test.ts`
 * pins every branch.
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < KIB) return `${Math.round(bytes)} B`;
  const kib = bytes / KIB;
  if (kib < 10) return `${kib.toFixed(2)} KiB`;
  if (kib < 100) return `${kib.toFixed(1)} KiB`;
  return `${Math.round(kib)} KiB`;
}
