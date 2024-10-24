import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import type { BookingSearchResultRoomSummary } from '@approved-premises/api'

export default Factory.define<BookingSearchResultRoomSummary>(() => ({
  id: faker.string.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
}))
