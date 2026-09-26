import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { THREE_ALIASES, DEDUPE } from './build/three-alias.ts';

interface CardMeta {
  id: string;
  module: string;
}

const cardsFile = new URL('./cards.json', import.meta.url);
const { cards } = JSON.parse(readFileSync(cardsFile, 'utf8')) as { cards: CardMeta[] };

/**
 * Chunk groups. Each vendored component directory becomes its own chunk so that a card's cost can
 * be measured in isolation, and the shared runtime (React, Three.js) is kept out of every card
 * chunk. Groups are matched by priority, highest first: without an explicit priority the bundler
 * folds a shared dependency into whichever card chunk reaches it first, which is how a 565 KiB
 * Three.js build ends up attributed to a 3 KiB card.
 */
const CHUNK_GROUPS = [
  { name: 'three', test: /node_modules[\\/]three[\\/]/, priority: 100 },
  { name: 'react', test: /node_modules[\\/]react/, priority: 100 },
  ...cards.map((card) => ({
    name: `card-${card.id}`,
    test: new RegExp(`vendor/threeui/lib/${card.module.split('/')[0]}/`),
    priority: 10,
  })),
];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: THREE_ALIASES,
    dedupe: [...DEDUPE],
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        codeSplitting: { groups: CHUNK_GROUPS },
      },
    },
  },
});
