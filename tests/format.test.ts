import { describe, expect, it } from 'vitest';
import { formatBytes } from '../src/lib/format';

describe('formatBytes', () => {
  it('prints zero and sub-kilobyte figures exactly', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(-1)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1023)).toBe('1023 B');
  });

  it('never loses a digit crossing the kilobyte boundary', () => {
    expect(formatBytes(1024)).toBe('1.00 KiB');
    expect(formatBytes(1536)).toBe('1.50 KiB');
    expect(formatBytes(10 * 1024)).toBe('10.0 KiB');
    expect(formatBytes(100 * 1024)).toBe('100 KiB');
  });

  it('keeps two decimals below ten, one below a hundred, none above', () => {
    expect(formatBytes(2934)).toBe('2.87 KiB');
    expect(formatBytes(21400)).toBe('20.9 KiB');
    expect(formatBytes(21400)).not.toBe('0.2 KiB');
    expect(formatBytes(224735)).toBe('219 KiB');
  });

  it('is monotonic: a bigger number never prints as a smaller one', () => {
    const toBytes = (printed: string): number => {
      const value = Number.parseFloat(printed);
      return printed.endsWith('KiB') ? value * 1024 : value;
    };
    let previous = -1;
    for (let bytes = 0; bytes <= 400 * 1024; bytes += 977) {
      const shown = toBytes(formatBytes(bytes));
      expect(shown, `${bytes} bytes printed as ${formatBytes(bytes)}`).toBeGreaterThanOrEqual(previous);
      previous = shown;
    }
  });

  it('treats a nonsense measurement as zero rather than printing NaN', () => {
    expect(formatBytes(Number.NaN)).toBe('0 B');
  });
});
