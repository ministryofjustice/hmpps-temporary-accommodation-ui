import { guidRegex } from './index'
import arrivalFactory from '../server/testutils/factories/arrival'
import { errorStub, getCombinations } from './utils'

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

const requiredFields = getCombinations(['arrivalDate', 'expectedDepartureDate'])

requiredFields.forEach((fields: Array<string>) => {
  arrivalStubs.push(errorStub(fields, `/premises/${guidRegex}/bookings/${guidRegex}/arrivals`, 'POST'))
})

export default arrivalStubs
