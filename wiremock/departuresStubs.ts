import { guidRegex } from './index'
import { errorStub, getCombinations } from './utils'
import departureFactory from '../server/testutils/factories/departure'

const departureStubs: Array<Record<string, unknown>> = []

departureStubs.push(
  {
    priority: 99,
    request: {
      method: 'POST',
      urlPathPattern: `/premises/${guidRegex}/bookings/${guidRegex}/departures`,
    },
    response: {
      status: 201,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify(departureFactory.build()),
    },
  },
  {
    request: {
      method: 'GET',
      urlPathPattern: `/premises/${guidRegex}/bookings/${guidRegex}/departures/${guidRegex}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify(departureFactory.build()),
    },
  },
)

const requiredFields = getCombinations(['dateTime', 'destinationProvider', 'moveOnCategory', 'reason'])

requiredFields.forEach((fields: Array<string>) => {
  departureStubs.push(errorStub(fields, `/premises/${guidRegex}/bookings/${guidRegex}/departures`))
})

export default departureStubs
