import { validateSearchQuery } from './bedspaceSearchUtils'
import { ObjectWithDateParts } from '../@types/ui'
import referenceData from '../testutils/factories/referenceData'

type BedspaceSearchQuery = ObjectWithDateParts<'startDate'> & {
  probationDeliveryUnits: Array<string>
  durationDays: string
}

interface ValidationError extends Error {
  data?: {
    'invalid-params'?: Array<{ propertyName: string; errorType: string }>
  }
}

describe('validateSearchQuery', () => {
  let query: BedspaceSearchQuery

  beforeEach(() => {
    query = {
      'startDate-day': '10',
      'startDate-month': '05',
      'startDate-year': '2024',
      probationDeliveryUnits: [referenceData.pdu().build().id, referenceData.pdu().build().id],
      durationDays: '10',
    } as unknown as BedspaceSearchQuery
  })

  const expectValidationError = (
    result: ValidationError | null,
    expectedErrors: Array<{ propertyName: string; errorType: string }>,
  ) => {
    expect(result).not.toBeNull()
    expect(result).toHaveProperty('data.invalid-params')
    expect(result!.data?.['invalid-params']).toEqual(expect.arrayContaining(expectedErrors))
  }

  it('returns an error when startDate is empty', () => {
    query['startDate-day'] = ''
    query['startDate-month'] = ''
    query['startDate-year'] = ''

    const result = validateSearchQuery(query)

    expectValidationError(result, [{ propertyName: '$.startDate', errorType: 'empty' }])
  })

  it('returns an error when startDate is invalid', () => {
    query['startDate-day'] = '31'
    query['startDate-month'] = '02'
    query['startDate-year'] = '20'

    const result = validateSearchQuery(query)

    expectValidationError(result, [{ propertyName: '$.startDate', errorType: 'invalid' }])
  })

  it('returns an error when durationDays is empty', () => {
    query.durationDays = ''

    const result = validateSearchQuery(query)

    expectValidationError(result, [{ propertyName: '$.durationDays', errorType: 'empty' }])
  })

  it('returns an error when durationDays is invalid (less than 1)', () => {
    query.durationDays = '0'

    const result = validateSearchQuery(query)

    expectValidationError(result, [{ propertyName: '$.durationDays', errorType: 'mustBeAtLeast1' }])
  })

  it('returns an error when probationDeliveryUnits is missing', () => {
    query.probationDeliveryUnits = []

    const result = validateSearchQuery(query)

    expectValidationError(result, [{ propertyName: '$.probationDeliveryUnits', errorType: 'empty' }])
  })

  it('returns multiple errors when multiple fields are invalid', () => {
    query['startDate-day'] = ''
    query['startDate-month'] = ''
    query['startDate-year'] = ''
    query.probationDeliveryUnits = []
    query.durationDays = ''

    const result = validateSearchQuery(query)

    expectValidationError(result, [
      { propertyName: '$.startDate', errorType: 'empty' },
      { propertyName: '$.probationDeliveryUnits', errorType: 'empty' },
      { propertyName: '$.durationDays', errorType: 'empty' },
    ])
  })

  it('returns null when there are no validation errors', () => {
    const result = validateSearchQuery(query)
    expect(result).toBeNull()
  })
})
