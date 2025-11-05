import { Cas3v2BedspaceSearchResult, Cas3v2BedspaceSearchResultOverlap } from '@approved-premises/api'

export function premisesKeyCharacteristics(result: Cas3v2BedspaceSearchResult): Array<string> {
  return result.premises.characteristics
    .sort((a, b) => a.description.localeCompare(b.description))
    .map(characteristic => characteristic.description)
}

export function bedspaceKeyCharacteristics(result: Cas3v2BedspaceSearchResult): Array<string> {
  return result.bedspace.characteristics
    .sort((a, b) => a.description.localeCompare(b.description))
    .map(characteristic => characteristic.description)
}

export function bedspaceOverlapResult(overlapResult: Cas3v2BedspaceSearchResultOverlap) {
  const { bedspaceId, crn, days, personType, assessmentId, isSexualRisk } = overlapResult
  const overlapDays = `${days} ${days === 1 ? 'day' : 'days'} overlap`

  const displayName = personType === 'FullPerson' ? overlapResult.name : 'Limited access offender'
  const referralNameOrCrn = personType === 'FullPerson' ? overlapResult.name : overlapResult.crn
  const sex = personType === 'FullPerson' ? overlapResult.sex : undefined
  const sexualRiskFlag = isSexualRisk ? 'Sexual Risk' : undefined

  return {
    bedspaceId,
    crn,
    overlapDays,
    personType,
    displayName,
    referralNameOrCrn,
    sex,
    assessmentId,
    sexualRiskFlag,
  }
}
