import { TemporaryAccommodationApplication as Application } from '../../@types/shared'
import { ApplicationSummaryData, YesOrNo } from '../../@types/ui'

export default function getSummaryDataFromApplication(application: Application): ApplicationSummaryData {
  return {
    /* eslint-disable dot-notation */
    isAbleToShare: getIsAbleToShare(
      application.data?.['placement-considerations']?.['accommodation-sharing']?.['accommodationSharing'],
    ),
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
