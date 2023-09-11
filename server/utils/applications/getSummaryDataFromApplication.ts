import { EligibilityReasonsT } from 'server/form-pages/apply/accommodation-need/eligibility/eligibilityReason'
import { TemporaryAccommodationApplication as Application } from '../../@types/shared'
import { ApplicationSummaryData, YesOrNo } from '../../@types/ui'

export default function getSummaryDataFromApplication(application: Application): ApplicationSummaryData {
  return {
    /* eslint-disable dot-notation */
    isAbleToShare: getIsAbleToShare(
      application.data?.['placement-considerations']?.['accommodation-sharing']?.['accommodationSharing'],
    ),
    releaseType: getReleaseType(application.data?.['eligibility']?.['eligibility-reason']?.['reason']),
    /* eslint-enable dot-notation */
  }
}

function getIsAbleToShare(ableToShare?: YesOrNo) {
  if (ableToShare === 'yes') {
    return true
  }

  if (ableToShare === 'no') {
    return false
  }

  return null
}

function getReleaseType(reason?: EligibilityReasonsT) {
  if (reason === 'homelessAfterRerelease') {
    return 'Rerelease'
  }

  if (reason === 'homelessFromApprovedPremises') {
    return 'Approved Premises'
  }

  if (reason === 'homelessFromBailAccommodation') {
    return 'Bail accommodation and support'
  }

  if (reason === 'homelessFromCustody') {
    return 'Custody'
  }

  return null
}
