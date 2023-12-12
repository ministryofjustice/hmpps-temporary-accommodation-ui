import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { BookingSearchResult } from '@approved-premises/api'
import bookingSearchResultFactory from './bookingSearchResult'
import { PaginatedResponse } from '../../@types/ui'

export default Factory.define<PaginatedResponse<BookingSearchResult>>(() => {
  const data = bookingSearchResultFactory.buildList(faker.number.int({ min: 5, max: 10 }))

  return {
    url: {
      params: new URLSearchParams(),
    },
    pageNumber: 1,
    totalResults: data.length,
    totalPages: 1,
    pageSize: 1000,
    data,
  }
})
