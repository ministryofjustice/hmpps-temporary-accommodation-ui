import { Bedspace, Property } from '@temporary-accommodation-ui/e2e'
import { fakerEN_GB as faker } from '@faker-js/faker'

export function getProperty(): Property {
  return {
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
    status: 'online',
  }
}

export function getBedspace(): Bedspace {
  return {
    reference: `Room ${faker.number.int({ min: 1, max: 9999 })}`,
    startDate: new Date(),
    details: [],
    additionalDetails: faker.lorem.sentences(5),
  }
}
