import { test as base } from '@playwright/test'
import { TestOptions } from '@temporary-accommodation-ui/e2e'

export const test = base.extend<TestOptions>({
  assessor: [
    {
      username: process.env.assessor_username as string,
      password: process.env.assessor_password as string,
      probationRegion: {
        id: process.env.acting_user_probation_region_id as string,
        name: process.env.acting_user_probation_region_name as string,
      },
    },
    { option: true },
  ],
  referrer: [
    {
      username: process.env.referrer_username as string,
      password: process.env.referrer_password as string,
    },
    { option: true },
  ],
})
