import { defineConfig } from 'vitest/config';
import { THREE_ALIASES, DEDUPE } from './build/three-alias.ts';

export default defineConfig({
  resolve: { alias: THREE_ALIASES, dedupe: [...DEDUPE] },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
