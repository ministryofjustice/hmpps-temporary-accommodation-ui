import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { BookingSearchResultPremisesSummary } from '@approved-premises/api'

export default Factory.define<BookingSearchResultPremisesSummary>(() => ({
  id: faker.datatype.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  addressLine1: faker.address.streetAddress(),
  addressLine2: faker.address.secondaryAddress(),
  town: faker.address.cityName(),
  postcode: faker.address.zipCode(),
}))
