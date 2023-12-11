import type { BookingSearchResult } from '@approved-premises/api'
import { bookingFactory, bookingSearchResultFactory, bookingSearchResultsFactory } from '../server/testutils/factories'
import { guidRegex } from './index'
import bookingSearchResultPremisesSummary from '../server/testutils/factories/bookingSearchResultPremisesSummary'
import { errorStub, getCombinations } from './utils'
import paths from '../server/paths/api'
import premises from './stubs/premises.json'

const bookingStubs: Array<Record<string, unknown>> = []

const bookingSummaries: Array<BookingSearchResult> = premises.map(item => {
  return bookingSearchResultFactory.build({
    premises: { ...bookingSearchResultPremisesSummary.build(), id: item.id },
  })
})

bookingStubs.push({
  priority: 99,
  request: {
    method: 'POST',
    urlPathPattern: `/premises/${guidRegex}/bookings`,
    bodyPatterns: [
      {
        matchesJsonPath: "$.[?(@.crn != '')]",
      },
      {
        matchesJsonPath: "$.[?(@.arrivalDate != '')]",
      },
      {
        matchesJsonPath: "$.[?(@.departureDate != '')]",
      },
    ],
  },
  response: {
    status: 201,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: bookingFactory.build(),
  },
})

bookingStubs.push({
  priority: 99,
  request: {
    method: 'GET',
    urlPathPattern: `/premises/${guidRegex}/bookings/${guidRegex}`,
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: bookingFactory.build(),
  },
})

bookingStubs.push({
  priority: 99,
  request: {
    method: 'GET',
    urlPathPattern: paths.bookings.search({}),
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: bookingSearchResultsFactory.build({
      totalResults: bookingSummaries.length,
      data: bookingSummaries,
    }),
  },
})

const requiredFields = getCombinations(['crn', 'arrivalDate', 'departureDate'])

requiredFields.forEach((fields: Array<string>) => {
  bookingStubs.push(errorStub(fields, `/premises/${guidRegex}/bookings`, 'POST'))
})

export default bookingStubs
