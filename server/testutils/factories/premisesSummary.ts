import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { TemporaryAccommodationPremisesSummary as PremisesSummary } from '@approved-premises/api'
import pduFactory from './pdu'

export default Factory.define<PremisesSummary>(() => ({
  id: faker.datatype.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  addressLine1: faker.address.streetAddress(),
  addressLine2: faker.address.secondaryAddress(),
  postcode: faker.address.zipCode(),
  bedCount: faker.datatype.number({ min: 0, max: 10 }),
  status: faker.helpers.arrayElement(['active', 'archived'] as const),
  pdu: pduFactory.build().name,
}))
