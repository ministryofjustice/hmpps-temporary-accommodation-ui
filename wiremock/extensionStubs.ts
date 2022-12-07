import { guidRegex } from './index'
import { getCombinations, errorStub } from './utils'
import extensionFactory from '../server/testutils/factories/extension'

const extensionStubs: Array<Record<string, unknown>> = []

extensionStubs.push({
  priority: 99,
  request: {
    method: 'POST',
    urlPathPattern: `/premises/${guidRegex}/bookings/${guidRegex}/extensions`,
  },
  response: {
    status: 201,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: extensionFactory.build(),
  },
})

const requiredFields = getCombinations(['newDepartureDate'])

requiredFields.forEach((fields: Array<string>) => {
  extensionStubs.push(errorStub(fields, `/premises/${guidRegex}/bookings/${guidRegex}/extensions`, 'POST'))
})

export default extensionStubs
