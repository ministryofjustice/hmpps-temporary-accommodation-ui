import { stubFor, guidRegex } from './index'
import arrivalFactory from '../server/testutils/factories/arrival'
import { getCombinations, errorStub } from './utils'

const arrivalStubs = [
  async () =>
    stubFor({
      request: {
        method: 'POST',
        urlPathPattern: `/premises/${guidRegex}/bookings/${guidRegex}/arrivals`,
      },
      response: {
        status: 201,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: JSON.stringify(arrivalFactory.build()),
      },
    }),
]

const requiredFields = getCombinations(['date', 'expectedDepartureDate'])

requiredFields.forEach((fields: Array<string>) => {
  arrivalStubs.push(async () => stubFor(errorStub(fields, `/premises/${guidRegex}/bookings/${guidRegex}/arrivals`)))
})

export default arrivalStubs
