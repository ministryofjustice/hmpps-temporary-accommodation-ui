import { stubFor } from './index'
import arrivalFactory from '../server/testutils/factories/arrival'
import { getCombinations, errorStub } from './utils'

const arrivalStubs = [
  async () =>
    stubFor({
      request: {
        method: 'POST',
        urlPathPattern:
          '/premises/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/bookings/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/arrivals',
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
  arrivalStubs.push(async () =>
    stubFor(
      errorStub(
        fields,
        '/premises/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/bookings/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/arrivals',
      ),
    ),
  )
})

export default arrivalStubs
