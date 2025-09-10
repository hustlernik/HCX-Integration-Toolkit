import js from '@eslint/js';
import globals from 'globals';
import nodePlugin from 'eslint-plugin-n';
import nodeImportsPlugin from 'eslint-plugin-import';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { off } from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  js.configs.recommended,
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '**/*.config.js',
    ],
  },
  {
    files: ['**/*.js'],
    rules: {
      'no-console': 'off', 
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        ...globals.es2020,
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      n: nodePlugin,
      import: nodeImportsPlugin,
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_', 
        varsIgnorePattern: '^_',
        caughtErrors: 'none'
      }],
      'no-undef': 'error',
      'no-useless-escape': 'off',
      'no-control-regex': 'off',
      'n/no-missing-import': 'off',
      'n/no-missing-require': 'off',
      'n/no-unpublished-import': 'off',
      'n/no-unsupported-features/es-syntax': 'off',
      'n/no-process-exit': 'off',
    },
  },
  {
    files: ['**/*.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      'no-undef': 'off',
    },
  },
];
