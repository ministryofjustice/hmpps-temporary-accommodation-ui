import { stubFor, guidRegex } from './index'
import bookingDtoFactory from '../server/testutils/factories/bookingDto'
import { getCombinations, errorStub } from './utils'

const bookingStubs = [
  async () =>
    stubFor({
      request: {
        method: 'POST',
        urlPathPattern: `/premises/${guidRegex}/bookings`,
        bodyPatterns: [
          {
            matchesJsonPath: "$.[?(@.CRN != '')]",
          },
          {
            matchesJsonPath: "$.[?(@.arrivalDate != '')]",
          },
          {
            matchesJsonPath: "$.[?(@.expectedDepartureDate != '')]",
          },
          {
            matchesJsonPath: "$.[?(@.keyWorker != '')]",
          },
        ],
      },
      response: {
        status: 201,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify(bookingDtoFactory.build()),
      },
    }),
]

const requiredFields = getCombinations(['CRN', 'name', 'arrivalDate', 'expectedDepartureDate', 'keyWorker'])

requiredFields.forEach((fields: Array<string>) => {
  bookingStubs.push(async () => stubFor(errorStub(fields, `/premises/${guidRegex}/bookings`)))
})

export default bookingStubs
