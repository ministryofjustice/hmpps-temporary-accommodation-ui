// @ts-check

import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default [
  ...hmppsConfig({
    extraIgnorePaths: ['assets/js', 'e2e_playwright/playwright-report'],
  }),
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
  {
    name: 'CAS3-test-dev-dependencies',
    files: ['e2e_playwright/**/*.ts', 'e2e/**/*.ts', 'cypress_shared/**/*.ts', 'integration_tests/**/*.ts'],
    rules: {
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
  },
]
