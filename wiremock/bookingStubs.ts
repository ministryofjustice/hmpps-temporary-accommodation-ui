import { guidRegex } from './index'
import bookingFactory from '../server/testutils/factories/booking'
import { errorStub, getCombinations } from './utils'

const bookingStubs: Array<Record<string, unknown>> = []

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

const requiredFields = getCombinations(['crn', 'arrivalDate', 'departureDate'])

requiredFields.forEach((fields: Array<string>) => {
  bookingStubs.push(errorStub(fields, `/premises/${guidRegex}/bookings`, 'POST'))
})

export default bookingStubs
