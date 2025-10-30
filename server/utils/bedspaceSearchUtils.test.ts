import { ObjectWithDateParts } from '@approved-premises/ui'
import {
  cas3BedspaceSearchResultsToCas3v2BedspaceSearchResults,
  characteristicPairsToCas3CharacteristicPairs,
  isCas3v2BedspaceSearchResults,
  overlapsToCas3v2BedspaceSearchResultOverlaps,
  validateSearchQuery,
} from './bedspaceSearchUtils'
import {
  bedspaceSearchResultsFactory,
  cas3v2BedspaceSearchResultsFactory,
  overlapFactory,
} from '../testutils/factories'
import cas3v2BedspaceSearchResults from '../testutils/factories/cas3v2BedspaceSearchResults'
import referenceDataFactory from '../testutils/factories/referenceData'

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
      probationDeliveryUnits: [referenceDataFactory.pdu().build().id, referenceDataFactory.pdu().build().id],
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

  // TODO -- ENABLE_CAS3V2_API cleanup: remove the following casting utilities tests
  describe('Cas3v2 casting utilities', () => {
    describe('isCas3v2BedspaceSearchResults', () => {
      it('returns true for a Cas3v2BedspaceSearchResults', () => {
        const results = cas3v2BedspaceSearchResultsFactory.build()

        expect(isCas3v2BedspaceSearchResults(results)).toEqual(true)
      })

      it('returns false for a Cas3BedspaceSearchResults', () => {
        const results = bedspaceSearchResultsFactory.build()

        expect(isCas3v2BedspaceSearchResults(results)).toEqual(false)
      })
    })

    describe('characteristicPairsToCas3CharacteristicPairs', () => {
      it('transforms a list of CharacteristicPair to a list of Cas3CharacteristicPair', () => {
        const characteristicPairs = referenceDataFactory.characteristic('room').buildList(1)

        expect(characteristicPairsToCas3CharacteristicPairs(characteristicPairs)).toEqual([
          { name: characteristicPairs[0].name, description: characteristicPairs[0].name },
        ])
      })
    })

    describe('overlapsToCas3v2BedspaceSearchResultOverlaps', () => {
      it('transforms a list of Cas3BedspaceSearchResultOverlap to a list of Cas3v2BedspaceSearchResultOverlap', () => {
        const overlap = overlapFactory.build()

        expect(overlapsToCas3v2BedspaceSearchResultOverlaps([overlap])).toEqual([
          {
            assessmentId: overlap.assessmentId,
            bedspaceId: overlap.roomId,
            bookingId: overlap.bookingId,
            crn: overlap.crn,
            days: overlap.days,
            isSexualRisk: overlap.isSexualRisk,
            name: overlap.name,
            sex: overlap.sex,
            personType: overlap.personType,
          },
        ])
      })
    })

    describe('cas3BedspaceSearchResultsToCas3v2BedspaceSearchResults', () => {
      it('returns a Cas3v2BedspaceSearchResults directly', () => {
        const searchResults = cas3v2BedspaceSearchResults.build()

        const results = cas3BedspaceSearchResultsToCas3v2BedspaceSearchResults(searchResults)

        expect(isCas3v2BedspaceSearchResults(results)).toEqual(true)
        expect(results).toEqual(searchResults)
      })

      it('transforms a Cas3BedspaceSearchResults to a Cas3v2BedspaceSearchResults', () => {
        const searchResults = bedspaceSearchResultsFactory.build()

        const results = cas3BedspaceSearchResultsToCas3v2BedspaceSearchResults(searchResults)

        expect(isCas3v2BedspaceSearchResults(results)).toEqual(true)
        expect(results.results[0]).toEqual({
          premises: expect.objectContaining({
            bedspaceCount: searchResults.results[0].premises.bedCount,
            bookedBedspaceCount: searchResults.results[0].premises.bookedBedCount,
            characteristics: characteristicPairsToCas3CharacteristicPairs(
              searchResults.results[0].premises.characteristics,
            ),
          }),
          bedspace: expect.objectContaining({
            id: searchResults.results[0].bed.id,
            reference: searchResults.results[0].room.name,
            characteristics: characteristicPairsToCas3CharacteristicPairs(
              searchResults.results[0].room.characteristics,
            ),
          }),
          overlaps: overlapsToCas3v2BedspaceSearchResultOverlaps(searchResults.results[0].overlaps),
        })
      })
    })
  })
})
