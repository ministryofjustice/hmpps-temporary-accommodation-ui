import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'

import { BookingPremisesSummary } from '@approved-premises/api'

export default Factory.define<BookingPremisesSummary>(() => ({
  id: faker.string.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
}))
