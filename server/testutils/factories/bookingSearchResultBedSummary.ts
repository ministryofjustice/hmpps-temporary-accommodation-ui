import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { BookingSearchResultBedSummary } from '@approved-premises/api'

export default Factory.define<BookingSearchResultBedSummary>(() => ({
  id: faker.datatype.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
}))
