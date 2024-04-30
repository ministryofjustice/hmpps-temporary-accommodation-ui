import {
  TemporaryAccommodationApplication as Application,
  SubmitTemporaryAccommodationApplication as SubmitApplication,
  UpdateTemporaryAccommodationApplication as UpdateApplication,
} from '../../@types/shared'
import { arrivalDateFromApplication } from '../../form-pages/utils'
import getSummaryDataFromApplication from './getSummaryDataFromApplication'
import {
  dutyToReferLocalAuthorityAreaNameFromApplication,
  dutyToReferOutcomeFromApplication,
  dutyToReferSubmissionDateFromApplication,
  eligibilityReasonFromApplication,
  hasHistoryOfArsonFromApplication,
  isApplicationEligibleFromApplication,
  isConcerningArsonBehaviourFromApplication,
  isConcerningSexualBehaviourFromApplication,
  isDutyToReferSubmittedFromApplication,
  isHistoryOfSexualOffenceFromApplication,
  isRegisteredSexOffenderFromApplication,
  needsAccessiblePropertyFromApplication,
  personReleaseDateFromApplication,
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
    dutyToReferLocalAuthorityAreaName: dutyToReferLocalAuthorityAreaNameFromApplication(application),
    dutyToReferOutcome: dutyToReferOutcomeFromApplication(application),
    needsAccessibleProperty: needsAccessiblePropertyFromApplication(application),
    isApplicationEligible: isApplicationEligibleFromApplication(application),
    eligibilityReason: eligibilityReasonFromApplication(application),
    personReleaseDate: personReleaseDateFromApplication(application),
    isRegisteredSexOffender: isRegisteredSexOffenderFromApplication(application),
    isHistoryOfSexualOffence: isHistoryOfSexualOffenceFromApplication(application),
    isConcerningSexualBehaviour: isConcerningSexualBehaviourFromApplication(application),
    hasHistoryOfArson: hasHistoryOfArsonFromApplication(application),
    isConcerningArsonBehaviour: isConcerningArsonBehaviourFromApplication(application),
  }
}
