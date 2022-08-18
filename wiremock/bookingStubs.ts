import { guidRegex } from './index'
import bookingDtoFactory from '../server/testutils/factories/bookingDto'
import { getCombinations, errorStub } from './utils'

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
        matchesJsonPath: "$.[?(@.expectedArrivalDate != '')]",
      },
      {
        matchesJsonPath: "$.[?(@.expectedDepartureDate != '')]",
      },
      {
        matchesJsonPath: "$.[?(@.keyWorker != '')]",
      },
    ],
  },
  response: {
    status: 201,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    body: JSON.stringify(bookingDtoFactory.build()),
  },
})

const requiredFields = getCombinations(['crn', 'name', 'expectedArrivalDate', 'expectedDepartureDate', 'keyWorker'])

requiredFields.forEach((fields: Array<string>) => {
  bookingStubs.push(errorStub(fields, `/premises/${guidRegex}/bookings`))
})

export default bookingStubs
