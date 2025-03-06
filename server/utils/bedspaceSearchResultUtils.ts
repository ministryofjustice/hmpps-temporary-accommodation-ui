import { Cas3BedspaceSearchResult, Cas3BedspaceSearchResultOverlap } from '@approved-premises/api'

export function premisesKeyCharacteristics(result: Cas3BedspaceSearchResult): Array<string> {
  return result.premises.characteristics
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(characteristic => characteristic.name)
}

export function bedspaceKeyCharacteristics(result: Cas3BedspaceSearchResult): Array<string> {
  return result.room.characteristics
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(characteristic => characteristic.name)
}

export function bedspaceOverlapResult(overlapResult: Cas3BedspaceSearchResultOverlap) {
  const { crn, days, roomId, personType, assessmentId, isSexualRisk } = overlapResult
  const overlapDays = `${days} ${days === 1 ? 'day' : 'days'} overlap`

  const displayName = personType === 'FullPerson' ? overlapResult.name : 'Limited access offender'
  const referralNameOrCrn = personType === 'FullPerson' ? overlapResult.name : overlapResult.crn
  const sex = personType === 'FullPerson' ? overlapResult.sex : undefined
  const sexualRiskFlag = isSexualRisk ? 'Sexual Risk' : undefined

  return {
    crn,
    overlapDays,
    roomId,
    personType,
    displayName,
    referralNameOrCrn,
    sex,
    assessmentId,
    sexualRiskFlag,
  }
}
