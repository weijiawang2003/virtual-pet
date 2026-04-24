// Flat config for ESLint 9+. See: https://docs.expo.dev/guides/using-eslint/
//
// eslint-config-expo/flat registers `@typescript-eslint` and `import` plugins
// *scoped to TS files*. Our custom rules that reference those plugins must use
// the same `files` filter, otherwise ESLint throws "could not find plugin".
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const TS_FILES = ['**/*.ts', '**/*.tsx', '**/*.d.ts'];

module.exports = defineConfig([
  expoConfig,

  // CLAUDE.md §4 — architecture boundaries, applies to TS source only.
  {
    files: TS_FILES,
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/core',
              from: './src/providers',
              message: 'core/** must not depend on providers/** (CLAUDE.md §4).',
            },
            {
              target: './src/core',
              from: './src/ui',
              message: 'core/** must not depend on ui/** (CLAUDE.md §4).',
            },
            {
              target: './src/providers',
              from: './src/ui',
              message: 'providers/** must not depend on ui/** (CLAUDE.md §4).',
            },
          ],
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-ignore': true, 'ts-expect-error': { descriptionFormat: '^.+$' } },
      ],
    },
  },

  // CLAUDE.md §6 — global style rules (apply to JS and TS).
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ClassDeclaration',
          message: 'Use functional components and hooks (CLAUDE.md §6).',
        },
      ],
    },
  },

  // core/** is pure TS (CLAUDE.md §4): no RN, no React, no Expo, no native libs.
  {
    files: ['src/core/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'react-native', message: 'core/** must be pure TS (CLAUDE.md §4).' },
            { name: 'react', message: 'core/** must be pure TS (CLAUDE.md §4).' },
          ],
          patterns: [
            { group: ['expo-*', '@expo/*'], message: 'core/** must be pure TS (CLAUDE.md §4).' },
            { group: ['react-native-*'], message: 'core/** must be pure TS (CLAUDE.md §4).' },
          ],
        },
      ],
    },
  },

  // Test files get looser rules.
  {
    files: ['**/*.test.{ts,tsx}', '**/*.vtime.test.ts', '__tests__/**/*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '_scaffold_tmp/**',
      '.expo/**',
      'coverage/**',
      'ios/**',
      'android/**',
    ],
  },
]);
