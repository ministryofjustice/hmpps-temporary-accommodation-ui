import { fakerEN_GB as faker } from '@faker-js/faker'
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
