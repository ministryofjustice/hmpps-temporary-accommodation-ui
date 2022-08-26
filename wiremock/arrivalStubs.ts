import { guidRegex } from './index'
import arrivalFactory from '../server/testutils/factories/arrival'
import { getCombinations, errorStub } from './utils'

const arrivalStubs: Array<Record<string, unknown>> = []

arrivalStubs.push({
  priority: 99,
  request: {
    method: 'POST',
    urlPathPattern: `/premises/${guidRegex}/bookings/${guidRegex}/arrivals`,
  },
  response: {
    status: 201,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: arrivalFactory.build(),
  },
})

const requiredFields = getCombinations(['date', 'expectedDepartureDate'])

requiredFields.forEach((fields: Array<string>) => {
  arrivalStubs.push(errorStub(fields, `/premises/${guidRegex}/bookings/${guidRegex}/arrivals`))
})

export default arrivalStubs
