/* istanbul ignore file */

import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'
import type { TemporaryAccommodationPremisesSummary as PremisesSummary } from '@approved-premises/api'
import referenceDataFactory from './referenceData'

export default Factory.define<PremisesSummary>(() => ({
  id: faker.datatype.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  addressLine1: faker.address.streetAddress(),
  addressLine2: faker.address.secondaryAddress(),
  town: faker.address.cityName(),
  postcode: faker.address.zipCode(),
  bedCount: 50,
  status: faker.helpers.arrayElement(['active', 'archived'] as const),
  pdu: referenceDataFactory.pdu().build().id,
}))
