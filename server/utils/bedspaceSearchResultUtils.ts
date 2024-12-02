import { BedSearchResult, TemporaryAccommodationBedSearchResultOverlap, Person } from '@approved-premises/api'
import { PersonType } from '../@types/shared/models/PersonType';
import { person } from '../../e2e/tests/stepDefinitions/utils';
import { personName } from '../utils/personUtils';

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
  overlapResult: Omit<TemporaryAccommodationBedSearchResultOverlap, 'sex'>,
) {
  const { crn, days, roomId, bookingId, personType, name, assessmentId } = overlapResult
  const overlapDays = `${days} ${days === 1 ? 'day' : 'days'} overlap`
  // const person: Person = { crn, type: personType }
  const personDisplayName = (personType === "FullPerson") ? name : 'Limited access offender'

  return {
    crn,
    overlapDays,
    roomId,
    bookingId,
    name,
    // person
    personName: personDisplayName,
    assessmentId
  }
}
