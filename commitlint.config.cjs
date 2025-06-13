/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type must be one of these
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation
        'style', // Formatting, missing semicolons, etc
        'refactor', // Code change that neither fixes bug nor adds feature
        'perf', // Performance improvement
        'test', // Adding tests
        'chore', // Maintenance tasks
        'ci', // CI configuration
        'build', // Build system or dependencies
        'revert', // Revert previous commit
      ],
    ],

    // Subject (description) rules
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-max-length': [2, 'always', 85],
    'subject-min-length': [2, 'always', 3],

    // Type rules
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    // Scope rules (optional)
    'scope-case': [2, 'always', 'lower-case'],
    'scope-max-length': [2, 'always', 20],

    // Header (full first line) rules
    'header-max-length': [2, 'always', 72],
    'header-min-length': [2, 'always', 10],

    // Body rules
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [2, 'always', 100],

    // Footer rules
    'footer-leading-blank': [2, 'always'],
    'footer-max-line-length': [2, 'always', 100],
  },
};
