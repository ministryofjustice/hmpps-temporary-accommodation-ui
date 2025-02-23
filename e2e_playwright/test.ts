import { test as base } from '@playwright/test'
import { TestOptions } from '@temporary-accommodation-ui/e2e'

export const test = base.extend<TestOptions>({
  user: [
    {
      name: process.env.HMPPS_AUTH_NAME as string,
      username: process.env.HMPPS_AUTH_USERNAME as string,
      password: process.env.HMPPS_AUTH_PASSWORD as string,
      email: process.env.HMPPS_AUTH_EMAIL as string,
    },
    { option: true },
  ],
})
