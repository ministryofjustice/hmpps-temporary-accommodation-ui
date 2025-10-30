import {
  BedSearchResultPremisesSummary,
  Cas3BedspaceSearchResultOverlap,
  Cas3BedspaceSearchResultPremisesSummary,
  Cas3BedspaceSearchResults,
  Cas3CharacteristicPair,
  Cas3v2BedspaceSearchResultOverlap,
  Cas3v2BedspaceSearchResults,
  CharacteristicPair,
} from '@approved-premises/api'
import { dateAndTimeInputsAreValidDates, dateIsBlank } from './dateUtils'
import { ObjectWithDateParts } from '../@types/ui'
import { insertGenericError } from './validation'
import { parseNumber } from './formUtils'

type BedspaceSearchQuery = ObjectWithDateParts<'startDate'> & {
  probationDeliveryUnits: Array<string>
  durationDays: string
}

export function validateSearchQuery(query: BedspaceSearchQuery): Error | null {
  const error = new Error() as Error & {
    data?: { 'invalid-params'?: Array<{ propertyName: string; errorType: string }> }
  }
  error.data = { 'invalid-params': [] }

  if (dateIsBlank(query, 'startDate')) {
    insertGenericError(error, 'startDate', 'empty')
  } else if (!dateAndTimeInputsAreValidDates(query, 'startDate')) {
    insertGenericError(error, 'startDate', 'invalid')
  }

  if (!query.probationDeliveryUnits?.length) {
    insertGenericError(error, 'probationDeliveryUnits', 'empty')
  }

  if (!query.durationDays) {
    insertGenericError(error, 'durationDays', 'empty')
  } else if (Number.isNaN(parseNumber(query.durationDays)) || parseNumber(query.durationDays) < 1) {
    insertGenericError(error, 'durationDays', 'mustBeAtLeast1')
  }

  return error.data?.['invalid-params']?.length ? error : null
}

// TODO -- ENABLE_CAS3V2_API cleanup: remove the following casting utilities and all usages
export const isCas3v2BedspaceSearchResults = (
  results: Cas3BedspaceSearchResults | Cas3v2BedspaceSearchResults,
): results is Cas3v2BedspaceSearchResults => results.results.length === 0 || 'bedspace' in results.results[0]

export const characteristicPairsToCas3CharacteristicPairs = (
  characteristics: Array<CharacteristicPair>,
): Array<Cas3CharacteristicPair> =>
  characteristics.map(characteristic => ({
    name: characteristic.name,
    description: characteristic.name,
  }))

const premisesSummaryToCas3v2BedspaceSearchResultPremisesSummary = (
  premises: BedSearchResultPremisesSummary,
): Cas3BedspaceSearchResultPremisesSummary => {
  const { bedCount, bookedBedCount, characteristics, ...sharedProperties } = premises

  return {
    ...sharedProperties,
    bedspaceCount: bedCount,
    bookedBedspaceCount: bookedBedCount,
    characteristics: characteristicPairsToCas3CharacteristicPairs(characteristics),
  }
}

export const overlapsToCas3v2BedspaceSearchResultOverlaps = (
  overlaps: Array<Cas3BedspaceSearchResultOverlap>,
): Array<Cas3v2BedspaceSearchResultOverlap> =>
  overlaps.map(overlap => {
    const { roomId, ...sharedProperties } = overlap

    return {
      ...sharedProperties,
      bedspaceId: roomId,
    }
  })

export const cas3BedspaceSearchResultsToCas3v2BedspaceSearchResults = (
  results: Cas3BedspaceSearchResults | Cas3v2BedspaceSearchResults,
): Cas3v2BedspaceSearchResults => {
  if (isCas3v2BedspaceSearchResults(results)) return results

  return {
    results: results.results.map(result => ({
      premises: premisesSummaryToCas3v2BedspaceSearchResultPremisesSummary(result.premises),
      bedspace: {
        id: result.bed.id,
        reference: result.room.name,
        characteristics: characteristicPairsToCas3CharacteristicPairs(result.room.characteristics),
      },
      overlaps: overlapsToCas3v2BedspaceSearchResultOverlaps(result.overlaps),
    })),
    resultsBedspaceCount: results.resultsBedCount,
    resultsPremisesCount: results.resultsPremisesCount,
  }
}
