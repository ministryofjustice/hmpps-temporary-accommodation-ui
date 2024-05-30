import { YesOrNo } from '@approved-premises/ui'
import { eligibilityReasons } from '../../form-pages/apply/accommodation-need/eligibility/eligibilityReason'
import { TemporaryAccommodationApplication as Application } from '../../@types/shared'
import { SessionDataError } from '../errors'
import { stripWhitespace } from '../utils'
import { releaseTypes } from '../../form-pages/apply/accommodation-need/sentence-information/releaseType'

const isDutyToReferSubmittedFromApplication = (application: Application): boolean => {
  const isDutyToReferSubmitted: string = (application.data as Record<string, unknown>)?.[
    'accommodation-referral-details'
  ]?.['dtr-submitted']?.dtrSubmitted

  if (!isDutyToReferSubmitted) {
    throw new SessionDataError('No duty to refer submitted data')
  }

  if (isDutyToReferSubmitted === 'no') return false

  return true
}

const dutyToReferSubmissionDateFromApplication = (application: Application): string => {
  if (!isDutyToReferSubmittedFromApplication(application)) {
    return ''
  }

  const dutyToReferSubmissionDate: string = (application.data as Record<string, unknown>)?.[
    'accommodation-referral-details'
  ]?.['dtr-details']?.date

  if (!dutyToReferSubmissionDate) {
    throw new SessionDataError('No duty to refer submitted date')
  }

  return stripWhitespace(dutyToReferSubmissionDate)
}

const dutyToReferLocalAuthorityAreaNameFromApplication = (application: Application) => {
  if (!isDutyToReferSubmittedFromApplication(application)) {
    return ''
  }

  const dutyToReferLocalAuthorityAreaName: string = (application.data as Record<string, unknown>)?.[
    'accommodation-referral-details'
  ]?.['dtr-details']?.localAuthorityAreaName

  return dutyToReferLocalAuthorityAreaName
}

const dutyToReferOutcomeFromApplication = (application: Application): string => {
  if (!isDutyToReferSubmittedFromApplication(application)) {
    return ''
  }

  const dutyToReferOutcome: string = (application.data as Record<string, unknown>)?.[
    'accommodation-referral-details'
  ]?.['dtr-details']?.dutyToReferOutcome

  if (!dutyToReferOutcome) {
    throw new SessionDataError('No duty to refer outcome data')
  }

  return dutyToReferOutcome
}

const needsAccessiblePropertyFromApplication = (application: Application): boolean => {
  const needsAccessibleProperty: string = (application.data as Record<string, unknown>)?.[
    'disability-cultural-and-specific-needs'
  ]?.['property-attributes-or-adaptations']?.propertyAttributesOrAdaptations

  if (!needsAccessibleProperty) {
    throw new SessionDataError('No accessible property data')
  }

  if (needsAccessibleProperty === 'no') return false

  return true
}

const isApplicationEligibleFromApplication = (application: Application): boolean => {
  const eligibilityReason: string = (application.data as Record<string, unknown>)?.eligibility?.['eligibility-reason']
    ?.reason

  if (!eligibilityReason) {
    throw new SessionDataError('No application eligibility data')
  }

  if (Object.keys(eligibilityReasons).includes(eligibilityReason)) {
    return true
  }

  return false
}

const eligibilityReasonFromApplication = (application: Application): string => {
  const eligibilityReason: string = (application.data as Record<string, unknown>)?.eligibility?.['eligibility-reason']
    ?.reason

  if (!eligibilityReason) {
    throw new SessionDataError('No application eligibility data')
  }

  if (Object.keys(eligibilityReasons).includes(eligibilityReason)) {
    return eligibilityReason
  }

  return null
}

const personReleaseDateFromApplication = (application: Application): string => {
  const personReleaseDate = (application.data as Record<string, unknown>)?.eligibility?.['release-date']?.releaseDate

  if (!personReleaseDate) {
    throw new SessionDataError('No person release date')
  }

  return stripWhitespace(personReleaseDate)
}

const yesOrNoToBoolOrUndefined = (value?: YesOrNo) => {
  if (value === 'yes') return true
  if (value === 'no') return false

  return undefined
}

const isRegisteredSexOffenderFromApplication = (application: Application): boolean => {
  const registeredSexOffender = (application.data as Record<string, unknown>)?.['offence-and-behaviour-summary']?.[
    'registered-sex-offender'
  ]?.registeredSexOffender

  return yesOrNoToBoolOrUndefined(registeredSexOffender)
}

const isHistoryOfSexualOffenceFromApplication = (application: Application): boolean => {
  const historyOfSexualOffence = (application.data as Record<string, unknown>)?.['offence-and-behaviour-summary']?.[
    'history-of-sexual-offence'
  ]?.historyOfSexualOffence

  return yesOrNoToBoolOrUndefined(historyOfSexualOffence)
}

const isConcerningSexualBehaviourFromApplication = (application: Application): boolean => {
  const concerningSexualBehaviour = (application.data as Record<string, unknown>)?.['offence-and-behaviour-summary']?.[
    'concerning-sexual-behaviour'
  ]?.concerningSexualBehaviour

  return yesOrNoToBoolOrUndefined(concerningSexualBehaviour)
}

const hasHistoryOfArsonFromApplication = (application: Application): boolean => {
  const historyOfArsonOffence = (application.data as Record<string, unknown>)?.['offence-and-behaviour-summary']?.[
    'history-of-arson-offence'
  ]?.historyOfArsonOffence

  return yesOrNoToBoolOrUndefined(historyOfArsonOffence)
}

const isConcerningArsonBehaviourFromApplication = (application: Application): boolean => {
  const concerningArsonBehaviour = (application.data as Record<string, unknown>)?.['offence-and-behaviour-summary']?.[
    'concerning-arson-behaviour'
  ]?.concerningArsonBehaviour

  return yesOrNoToBoolOrUndefined(concerningArsonBehaviour)
}

const releaseTypesFromApplication = (application: Application): Array<string> => {
  const releaseTypesData: Array<string> =
    (application.data as Record<string, unknown>)?.['sentence-information']?.['release-type']?.releaseTypes || []

  if (!releaseTypesData.every(key => Boolean(releaseTypes[key]))) {
    return []
  }

  return releaseTypesData.map(key => releaseTypes[key].abbr)
}

export {
  dutyToReferSubmissionDateFromApplication,
  dutyToReferLocalAuthorityAreaNameFromApplication,
  dutyToReferOutcomeFromApplication,
  eligibilityReasonFromApplication,
  isApplicationEligibleFromApplication,
  isDutyToReferSubmittedFromApplication,
  needsAccessiblePropertyFromApplication,
  personReleaseDateFromApplication,
  isRegisteredSexOffenderFromApplication,
  isHistoryOfSexualOffenceFromApplication,
  isConcerningSexualBehaviourFromApplication,
  hasHistoryOfArsonFromApplication,
  isConcerningArsonBehaviourFromApplication,
  releaseTypesFromApplication,
}
