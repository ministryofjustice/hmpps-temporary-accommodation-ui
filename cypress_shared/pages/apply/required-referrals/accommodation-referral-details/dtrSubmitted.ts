import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class DtrSubmittedPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Has the Duty to refer (England) or Application for Assistance (Wales) been submitted?',
      application,
      'accommodation-referral-details',
      'dtr-submitted',
      paths.applications.show({ id: application.id }),
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('dtrSubmitted')
  }
}
