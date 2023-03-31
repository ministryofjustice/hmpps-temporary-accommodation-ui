import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'

import type { BookingSearchResults } from '@approved-premises/api'
import bookingSearchResultFactory from './bookingSearchResult'

export default Factory.define<BookingSearchResults>(() => {
  const results = bookingSearchResultFactory.buildList(faker.datatype.number({ min: 5, max: 10 }))

  return {
    resultsCount: results.length,
    results,
  }
})
