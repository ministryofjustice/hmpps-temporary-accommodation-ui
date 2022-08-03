import { stubFor } from './index'
import nonArrivalFactory from '../server/testutils/factories/nonArrival'
import { getCombinations, errorStub } from './utils'

const nonArrivalStubs = [
  async () =>
    stubFor({
      request: {
        method: 'POST',
        urlPathPattern:
          '/premises/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/bookings/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/non-arrivals',
        bodyPatterns: [
          {
            matchesJsonPath: "$.[?(@.date != '')]",
          },
          {
            matchesJsonPath: "$.[?(@.reason != '')]",
          },
        ],
      },
      response: {
        status: 201,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: JSON.stringify(nonArrivalFactory.build()),
      },
    }),
]

const requiredFields = getCombinations(['date', 'reason'])

requiredFields.forEach((fields: Array<string>) => {
  nonArrivalStubs.push(async () =>
    stubFor(
      errorStub(
        fields,
        '/premises/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/bookings/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/non-arrivals',
        ['reason'],
      ),
    ),
  )
})

export default nonArrivalStubs
