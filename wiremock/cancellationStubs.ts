import { guidRegex } from './index'
import cancellationFactory from '../server/testutils/factories/cancellation'
import { getCombinations, errorStub } from './utils'

const cancellationStubs: Array<Record<string, unknown>> = []

cancellationStubs.push(
  {
    priority: 99,
    request: {
      method: 'POST',
      urlPathPattern: `/premises/${guidRegex}/bookings/${guidRegex}/cancellations`,
    },
    response: {
      status: 201,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: cancellationFactory.build(),
    },
  },
  {
    request: {
      method: 'GET',
      urlPathPattern: `/premises/${guidRegex}/bookings/${guidRegex}/cancellations/${guidRegex}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: cancellationFactory.build(),
    },
  },
)

const requiredFields = getCombinations(['date', 'reason'])

requiredFields.forEach((fields: Array<string>) => {
  cancellationStubs.push(errorStub(fields, `/premises/${guidRegex}/bookings/${guidRegex}/cancellations`))
})

export default cancellationStubs
