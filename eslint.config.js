import js from '@eslint/js';
import globals from 'globals';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import nodePlugin from 'eslint-plugin-n';
import nodeImportsPlugin from 'eslint-plugin-import';

const nodePluginConfig = {
  plugins: {
    n: nodePlugin,
  },
  rules: {
    ...nodePlugin.configs['recommended-module'].rules,
    ...nodePlugin.configs['recommended-script'].rules,
  },
};
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export default [
  js.configs.recommended,
  nodePluginConfig,
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '**/dist/**',
      'build/**',
      '**/build/**',
      'coverage/**',
      '**/coverage/**',
      '.next/**',
      '**/.next/**',
      'apps/hcx-ui/dist/**',
      'apps/provider-stub/dist/**',
      'commitlint.config.cjs',
      '**/*.config.js',
    ],
  },
  {
    files: ['**/*.js'],
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
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? ['error', { allow: ['warn', 'error'] }] : 'off',
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_', 
        varsIgnorePattern: '^_',
        caughtErrors: 'none'
      }],
      'no-undef': 'error',
      'no-control-regex': 'off',
      'n/no-missing-require': 'error',
      'n/no-unpublished-import': 'off',
      'n/no-unsupported-features/es-syntax': 'off',
      'no-useless-escape': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020,
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
        tsconfigRootDir: path.dirname(fileURLToPath(import.meta.url)),
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      'react-hooks': reactHooksPlugin,
      'unused-imports': unusedImportsPlugin,
      'react-refresh': reactRefreshPlugin,
      react: reactPlugin,
      n: nodePlugin,
      import: nodeImportsPlugin,
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-unused-vars': [
        'off',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-unused-vars': 'off',
      'no-console': ['off', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-undef': 'off',
      'no-redeclare': 'off',
      'no-empty': 'off',
      'react/prop-types': 'off',
      'n/no-missing-import': 'off',
      'n/no-process-env': 'off',
      'n/no-unsupported-features/es-syntax': 'off',
      'n/no-unsupported-features/node-builtins': 'off',
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      'n/no-unsupported-features/es-syntax': 'off',
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react-hooks': reactHooksPlugin,
      'unused-imports': unusedImportsPlugin,
      'react-refresh': reactRefreshPlugin,
      react: reactPlugin,
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-console': 'off',
      'no-debugger': 'error',
      'react/prop-types': 'off',
    },
    ignores: ['dist', '**/*.config.js'],
  },
  {
    files: ['services/fhir-utilities/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
      parserOptions: {
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': 'off',
      'no-console': 'off',
      'no-undef': 'off',
      'no-useless-escape': 'off',
    },
  },
  {
    files: [
      '**/postcss.config.js',
      '**/eslint.config.js',
      '**/.eslintrc.js',
      '**/*.config.cjs',
      '**/*.config.js',
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      'no-undef': 'off',
    },
  },
];
