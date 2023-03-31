import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { BookingSearchResultRoomSummary } from '@approved-premises/api'

export default Factory.define<BookingSearchResultRoomSummary>(() => ({
  id: faker.datatype.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
}))
