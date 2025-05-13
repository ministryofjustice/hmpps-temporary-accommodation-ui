import { test as base } from '@playwright/test'
import { TestOptions } from '@temporary-accommodation-ui/e2e'

export const test = base.extend<TestOptions>({
  assessor: [
    {
      username: process.env.ASSESSOR_USERNAME as string,
      password: process.env.ASSESSOR_PASSWORD as string,
      probationRegion: {
        // Probation region for user temporary-accommodation-training-1
        id: 'ca979718-b15d-4318-9944-69aaff281cad',
        name: 'East of England',
      },
    },
    { option: true },
  ],
  referrer: [
    {
      username: process.env.REFERRER_USERNAME as string,
      password: process.env.REFERRER_PASSWORD as string,
    },
    { option: true },
  ],
})
