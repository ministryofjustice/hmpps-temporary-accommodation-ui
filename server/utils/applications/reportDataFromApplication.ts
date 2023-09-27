import { eligibilityReasons } from '../../form-pages/apply/accommodation-need/eligibility/eligibilityReason'
import { TemporaryAccommodationApplication as Application } from '../../@types/shared'
import { SessionDataError } from '../errors'

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

  return dutyToReferSubmissionDate
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

export {
  dutyToReferSubmissionDateFromApplication,
  isApplicationEligibleFromApplication,
  isDutyToReferSubmittedFromApplication,
  needsAccessiblePropertyFromApplication,
}
