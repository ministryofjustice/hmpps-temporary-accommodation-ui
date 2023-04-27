import { turnaroundFactory } from '../server/testutils/factories'
import { guidRegex } from './index'
import { errorStub, getCombinations } from './utils'

const extensionStubs: Array<Record<string, unknown>> = []

extensionStubs.push({
  priority: 99,
  request: {
    method: 'POST',
    urlPathPattern: `/premises/${guidRegex}/bookings/${guidRegex}/turnarounds`,
  },
  response: {
    status: 201,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: turnaroundFactory.build(),
  },
})

const requiredFields = getCombinations(['workingDays'])

requiredFields.forEach((fields: Array<string>) => {
  extensionStubs.push(errorStub(fields, `/premises/${guidRegex}/bookings/${guidRegex}/turnarounds`, 'POST'))
})

export default extensionStubs
