import {
  TemporaryAccommodationApplication as Application,
  SubmitTemporaryAccommodationApplication as SubmitApplication,
  UpdateTemporaryAccommodationApplication as UpdateApplication,
} from '../../@types/shared'
import { arrivalDateFromApplication } from '../../form-pages/utils'
import getSummaryDataFromApplication from './getSummaryDataFromApplication'
import {
  dutyToReferSubmissionDateFromApplication,
  isApplicationEligibleFromApplication,
  isDutyToReferSubmittedFromApplication,
  needsAccessiblePropertyFromApplication,
} from './reportDataFromApplication'

export const getApplicationUpdateData = (application: Application): UpdateApplication => {
  return {
    data: application.data,
    type: 'CAS3',
  }
}

export const getApplicationSubmissionData = (application: Application): SubmitApplication => {
  return {
    translatedDocument: application.document,
    type: 'CAS3',
    arrivalDate: arrivalDateFromApplication(application),
    summaryData: getSummaryDataFromApplication(application),
    isDutyToReferSubmitted: isDutyToReferSubmittedFromApplication(application),
    dutyToReferSubmissionDate: dutyToReferSubmissionDateFromApplication(application),
    needsAccessibleProperty: needsAccessiblePropertyFromApplication(application),
    isApplicationEligible: isApplicationEligibleFromApplication(application),
  }
}
