import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'
import ApplyPage from './applyPage'

export default class DtrSubmittedPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Has the Duty to Refer (DTR) / National Offender Pathway (NOP) been submitted?',
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
