import { confirmationFactory } from '../server/testutils/factories'
import { guidRegex } from './index'

const confirmationStubs: Array<Record<string, unknown>> = []

confirmationStubs.push({
  priority: 99,
  request: {
    method: 'POST',
    urlPathPattern: `/premises/${guidRegex}/bookings/${guidRegex}/confirmations`,
  },
  response: {
    status: 201,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: confirmationFactory.build(),
  },
})

export default confirmationStubs
