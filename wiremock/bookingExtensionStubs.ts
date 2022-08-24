import { guidRegex } from './index'
import bookingDtoFactory from '../server/testutils/factories/bookingDto'
import { errorStub } from './utils'

export default [
  {
    priority: 99,
    request: {
      method: 'POST',
      urlPathPattern: `/premises/${guidRegex}/bookings/${guidRegex}/extensions`,
      bodyPatterns: [
        {
          matchesJsonPath: "$.[?(@.newDepartureDate != '')]",
        },
      ],
    },
    response: {
      status: 201,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: bookingDtoFactory.build(),
    },
  },

  errorStub(['newDepartureDate'], `/premises/${guidRegex}/bookings/${guidRegex}/extensions`),
]
