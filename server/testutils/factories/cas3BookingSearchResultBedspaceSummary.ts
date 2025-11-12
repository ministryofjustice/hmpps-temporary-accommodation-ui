import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import type { Cas3BookingSearchResultBedspaceSummary } from '@approved-premises/api'

export default Factory.define<Cas3BookingSearchResultBedspaceSummary>(() => ({
  id: faker.string.uuid(),
  reference: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
}))
