import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { Cas3Premises } from '@approved-premises/api'
import characteristicFactory from './characteristic'
import referenceDataFactory from './referenceData'

export default Factory.define<Cas3Premises>(() => ({
  id: faker.string.uuid(),
  reference: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  addressLine1: faker.location.streetAddress(),
  addressLine2: faker.location.secondaryAddress(),
  town: faker.location.city(),
  postcode: faker.location.zipCode(),
  probationRegion: referenceDataFactory.probationRegion().build(),
  probationDeliveryUnit: referenceDataFactory.pdu().build(),
  status: faker.helpers.arrayElement(['online', 'archived'] as const),
  totalOnlineBedspaces: faker.number.int({ min: 1, max: 10 }),
  totalArchivedBedspaces: faker.number.int({ min: 1, max: 5 }),
  totalUpcomingBedspaces: faker.number.int({ min: 1, max: 5 }),
  characteristics: characteristicFactory.buildList(5),
}))
