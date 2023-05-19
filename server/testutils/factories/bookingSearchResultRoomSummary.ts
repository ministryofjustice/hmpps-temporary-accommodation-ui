import type { BookingSearchResultRoomSummary } from '@approved-premises/api'
import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

export default Factory.define<BookingSearchResultRoomSummary>(() => ({
  id: faker.string.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
}))
