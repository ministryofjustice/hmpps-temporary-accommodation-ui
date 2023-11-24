/* istanbul ignore file */

import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'
import type { TemporaryAccommodationPremisesSummary as PremisesSummary } from '@approved-premises/api'
import referenceDataFactory from './referenceData'

export default Factory.define<PremisesSummary>(() => ({
  id: faker.string.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  addressLine1: faker.location.streetAddress(),
  addressLine2: faker.location.secondaryAddress(),
  town: faker.location.city(),
  postcode: faker.location.zipCode(),
  bedCount: 50,
  status: faker.helpers.arrayElement(['active', 'archived'] as const),
  pdu: referenceDataFactory.pdu().build().id,
  localAuthorityAreaName: faker.word.noun(),
  service: 'CAS3',
}))
