import { stubFor, guidRegex } from './index'
import { errorStub } from './utils'
import departureFactory from '../server/testutils/factories/departure'

const departureStubs = [
  async () =>
    stubFor({
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
    }),

  async () =>
    stubFor({
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
    }),
]

departureStubs.push(async () =>
  stubFor(
    errorStub(
      ['dateTime', 'destinationProvider', 'moveOnCategory', 'reason'],
      `/premises/${guidRegex}/bookings/${guidRegex}/departures`,
    ),
  ),
)

export default departureStubs
