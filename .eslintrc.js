module.exports = {
  root: true,
  ignorePatterns: ['**/dist/**', '**/node_modules/**', '**/build/**', '**/coverage/**'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    'no-redeclare': 'off',
    'no-undef': 'off',
    'no-empty': 'off',
    'no-console': 'off',
    'no-unused-expressions': 'off',
    'import/order': 'off',
    'import/no-unresolved': 'off',
    'import/no-named-as-default-member': 'off',
    'react-refresh/only-export-components': 'off',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
};
