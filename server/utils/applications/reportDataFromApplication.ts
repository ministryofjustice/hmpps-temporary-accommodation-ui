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

export { dutyToReferSubmissionDateFromApplication, isDutyToReferSubmittedFromApplication }
