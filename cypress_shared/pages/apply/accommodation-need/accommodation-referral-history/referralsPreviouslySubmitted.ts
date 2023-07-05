import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class ReferralsPreviouslySubmittedPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Behaviour in previous accommodation',
      application,
      'accommodation-referral-history',
      'referrals-previously-submitted',
      paths.applications.show({ id: application.id }),
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('referralsPreviouslySubmitted')
  }
}
