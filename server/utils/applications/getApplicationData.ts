import {
  TemporaryAccommodationApplication as Application,
  Cas3SubmitApplication as SubmitApplication,
  Cas3UpdateApplication as UpdateApplication,
} from '../../@types/shared'
import { arrivalDateFromApplication } from '../../form-pages/utils'
import getSummaryDataFromApplication from './getSummaryDataFromApplication'
import {
  dutyToReferLocalAuthorityAreaNameFromApplication,
  dutyToReferOutcomeFromApplication,
  dutyToReferSubmissionDateFromApplication,
  eligibilityReasonFromApplication,
  getOutOfRegionDataFromApplication,
  hasHistoryOfArsonFromApplication,
  isApplicationEligibleFromApplication,
  isConcerningArsonBehaviourFromApplication,
  isConcerningSexualBehaviourFromApplication,
  isDutyToReferSubmittedFromApplication,
  isHistoryOfSexualOffenceFromApplication,
  isRegisteredSexOffenderFromApplication,
  needsAccessiblePropertyFromApplication,
  personReleaseDateFromApplication,
  probationDeliveryUnitIdFromApplication,
  releaseTypesFromApplication,
} from './reportDataFromApplication'

export const getApplicationUpdateData = (application: Application): UpdateApplication => {
  return {
    data: application.data,
  }
}

export const getApplicationSubmissionData = (application: Application): SubmitApplication => {
  const applicationData = {
    translatedDocument: application.document,
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
    prisonReleaseTypes: releaseTypesFromApplication(application),
    probationDeliveryUnitId: probationDeliveryUnitIdFromApplication(application),
    ...getOutOfRegionDataFromApplication(application),
  }
  return applicationData
}
