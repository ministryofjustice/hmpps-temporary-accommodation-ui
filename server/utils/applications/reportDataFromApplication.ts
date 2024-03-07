import { eligibilityReasons } from '../../form-pages/apply/accommodation-need/eligibility/eligibilityReason'
import { TemporaryAccommodationApplication as Application } from '../../@types/shared'
import { SessionDataError } from '../errors'
import { stripWhitespace } from '../utils'

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
  const dutyToReferLocalAuthorityAreaName: string = (application.data as Record<string, unknown>)?.[
    'accommodation-referral-details'
  ]?.['dtr-details']?.localAuthorityAreaName

  if (!dutyToReferLocalAuthorityAreaName) {
    throw new SessionDataError('No duty to refer local authority area name data')
  }

  return dutyToReferLocalAuthorityAreaName
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

export {
  dutyToReferSubmissionDateFromApplication,
  dutyToReferLocalAuthorityAreaNameFromApplication,
  eligibilityReasonFromApplication,
  isApplicationEligibleFromApplication,
  isDutyToReferSubmittedFromApplication,
  needsAccessiblePropertyFromApplication,
  personReleaseDateFromApplication,
}
