import { guidRegex } from './index'
import nonArrivalFactory from '../server/testutils/factories/nonArrival'
import { errorStub, getCombinations } from './utils'

const nonArrivalStubs: Array<Record<string, unknown>> = []

nonArrivalStubs.push({
  priority: 99,
  request: {
    method: 'POST',
    urlPathPattern: `/premises/${guidRegex}/bookings/${guidRegex}/non-arrivals`,
    bodyPatterns: [
      {
        matchesJsonPath: "$.[?(@.date != '')]",
      },
      {
        matchesJsonPath: "$.[?(@.reason != '')]",
      },
    ],
  },
  response: {
    status: 201,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: nonArrivalFactory.build(),
  },
})

const requiredFields = getCombinations(['date', 'reason'])

requiredFields.forEach((fields: Array<string>) => {
  nonArrivalStubs.push(errorStub(fields, `/premises/${guidRegex}/bookings/${guidRegex}/non-arrivals`, 'POST'))
})

export default nonArrivalStubs
