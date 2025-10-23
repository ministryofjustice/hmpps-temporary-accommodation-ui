import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { Cas3BookingSearchResult } from '@approved-premises/api'
import { PaginatedResponse } from '../../@types/ui'
import cas3BookingSearchResultFactory from './cas3BookingSearchResult'

export default Factory.define<PaginatedResponse<Cas3BookingSearchResult>>(() => {
  const data = cas3BookingSearchResultFactory.buildList(faker.number.int({ min: 5, max: 10 }))

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
