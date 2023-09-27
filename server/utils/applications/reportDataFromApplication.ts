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

export {
  dutyToReferSubmissionDateFromApplication,
  isDutyToReferSubmittedFromApplication,
  needsAccessiblePropertyFromApplication,
}
