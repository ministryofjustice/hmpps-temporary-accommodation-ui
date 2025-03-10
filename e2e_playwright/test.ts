import { test as base } from '@playwright/test'
import { TestOptions } from '@temporary-accommodation-ui/e2e'

export const test = base.extend<TestOptions>({
  assessor: [
    {
      username: process.env.ASSESSOR_USERNAME as string,
      password: process.env.ASSESSOR_PASSWORD as string,
      probationRegion: {
        id: process.env.ACTING_USER_PROBATION_REGION_ID as string,
        name: process.env.ACTING_USER_PROBATION_REGION_NAME as string,
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
  premises: {
    name: 'Test Premise 1',
    addressLine1: 'Test Road',
    addressLine2: 'Test Lane',
    town: 'Gloucester',
    postcode: 'GL22 XXX',
    localAuthorityArea: 'Gloucester',
    probationRegionName: 'South West',
    pdu: 'Gloucestershire',
  },
})
