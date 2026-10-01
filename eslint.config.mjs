// @ts-check

import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default [
  ...hmppsConfig({
    extraIgnorePaths: ['assets/js', 'e2e_playwright/playwright-report'],
  }),
  {
    name: 'CAS3- e2e rules',
    files: ['e2e/**/*.ts', 'e2e/**/*.js', 'cypress.config.e2e.ts'],
    rules: {
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
  },
  {
    name: 'CAS3-specific rules',
    files: ['**/*.ts'],
    ignores: ['**/*.js'],
    rules: {
      'import/prefer-default-export': 'off',
      'max-classes-per-file': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-unused-vars': [
        1,
        {
          argsIgnorePattern: 'res|next|^err|_',
          ignoreRestSiblings: true,
          caughtErrors: 'none',
        },
      ],
      'no-param-reassign': ['error', { props: false }],
      'no-underscore-dangle': [2, { allowAfterThis: true }],
      'no-empty-function': ['error', { allow: ['constructors'] }],
    },
  },
]
