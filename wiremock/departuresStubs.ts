import { stubFor, guidRegex } from './index'

import departureFactory from '../server/testutils/factories/departure'

export default [
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
