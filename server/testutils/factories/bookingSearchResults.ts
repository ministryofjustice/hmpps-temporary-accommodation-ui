import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { BookingSearchResults } from '@approved-premises/api'
import bookingSearchResultFactory from './bookingSearchResult'

export default Factory.define<BookingSearchResults>(() => {
  const results = bookingSearchResultFactory.buildList(faker.number.int({ min: 5, max: 10 }))

  return {
    resultsCount: results.length,
    results,
  }
})
