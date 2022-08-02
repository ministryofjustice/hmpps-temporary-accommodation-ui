import { stubFor } from './index'
import bookingDtoFactory from '../server/testutils/factories/bookingDto'

const getCombinations = (arr: Array<string>) => {
  const result: Array<Array<string>> = []
  const f = (prefixes: Array<string>, suffixes: Array<string>) => {
    for (let i = 0; i < suffixes.length; i += 1) {
      result.push([...prefixes, suffixes[i]])
      f(
        [...prefixes, suffixes[i]],
        suffixes.filter(suffix => suffixes.indexOf(suffix) !== i),
      )
    }
  }
  f([], arr)
  return result
}

const errorStub = (fields: Array<string>) => {
  const bodyPatterns = fields.map(field => {
    return {
      matchesJsonPath: `$.[?(@.${field} === '')]`,
    }
  })

  const invalidParams = fields.map(field => {
    return {
      propertyName: field,
      errorType: 'blank',
    }
  })

  return {
    request: {
      method: 'POST',
      urlPathPattern: `/premises/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/bookings`,
      bodyPatterns,
    },
    response: {
      status: 400,
      headers: {
        'Content-Type': 'application/problem+json;charset=UTF-8',
      },
      jsonBody: {
        type: 'https://example.net/validation-error',
        title: 'Invalid request parameters',
        code: 400,
        'invalid-params': invalidParams,
      },
    },
  }
}

const bookingStubs = [
  async () =>
    stubFor({
      request: {
        method: 'POST',
        urlPathPattern: `/premises/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/bookings`,
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
  bookingStubs.push(async () => stubFor(errorStub(fields)))
})

export default bookingStubs
