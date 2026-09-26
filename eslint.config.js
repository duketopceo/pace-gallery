import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'vendor/threeui/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.ts', 'build/**/*.ts', '*.config.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': ['error', { allow: ['error', 'warn'] }],
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: globals.node },
    rules: { 'no-console': 'off' },
  },
  {
    // `scripts/check-dist.mjs` is a byte-for-byte copy of the deploy gate that owns this build
    // (DUK-75, HEAD 0679e02). It is vendored unmodified on purpose: its value here is that it is
    // the same file the pipeline runs, so `npm run check` rehearses the real gate instead of a
    // lookalike. Its sha256 is recorded in README.md. Linting it would mean editing it, which
    // would break that property — so the one unused import it carries is left in place.
    files: ['scripts/check-dist.mjs'],
    rules: { '@typescript-eslint/no-unused-vars': 'off' },
  },
);
