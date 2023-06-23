import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class ReferralHistoryDetailsPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      `What type of accommodation was the referral for`,
      application,
      'accommodation-referral-history',
      'referral-history-details',
      paths.applications.pages.show({
        id: application.id,
        task: 'accommodation-referral-history',
        page: 'referrals-previously-submitted',
      }),
    )
  }

  completeForm() {
    this.checkCheckboxesWithDetailsFromPageBody('accommodationTypes')
  }
}
