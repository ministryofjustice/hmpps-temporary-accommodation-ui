import { BedSearchResult, TemporaryAccommodationBedSearchResultOverlap } from '@approved-premises/api'

export function premisesKeyCharacteristics(result: BedSearchResult): Array<string> {
  return result.premises.characteristics
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(characteristic => characteristic.name)
}

export function bedspaceKeyCharacteristics(result: BedSearchResult): Array<string> {
  return result.room.characteristics
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(characteristic => characteristic.name)
}

export function bedspaceOverlapResult(
  overlapResult: Omit<TemporaryAccommodationBedSearchResultOverlap, 'sex' | 'assesmentId'>,
) {
  const { crn, days, roomId, bookingId, personType } = overlapResult
  const overlapDays = `${days} ${days === 1 ? 'day' : 'days'} overlap`

  const displayName = personType === 'FullPerson' ? overlapResult.name : 'Limited access offender'

  return {
    crn,
    overlapDays,
    roomId,
    bookingId,
    personType,
    displayName,
  }
}
