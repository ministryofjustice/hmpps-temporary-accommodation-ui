import { fakerEN_GB as faker } from '@faker-js/faker'
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
  property: {
    name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
    addressLine1: faker.location.streetAddress(),
    addressLine2: faker.location.secondaryAddress(),
    town: faker.location.city(),
    postcode: faker.location.zipCode(),
    notes: faker.lorem.lines(5),
    turnaroundWorkingDayCount: faker.number.int({ min: 1, max: 5 }),
    localAuthority: undefined,
    probationRegion: undefined,
    pdu: undefined,
    propertyAttributesValues: [],
    status: undefined,
  },
})
