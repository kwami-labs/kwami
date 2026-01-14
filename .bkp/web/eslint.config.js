import path from 'node:path';
import { fileURLToPath } from 'node:url';

import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.vite/**',
      'coverage/**',
    ],
  },

  // Base TypeScript recommended rules (flat-config compatible)
  ...tsPlugin.configs['flat/recommended'],

  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // TS handles undefined globals via types; avoid duplicate/noisy core rule
      'no-undef': 'off',

      // Keep the previous project rule intent
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
      'prefer-const': 'warn',
      'no-var': 'error',
    },
  },
];
