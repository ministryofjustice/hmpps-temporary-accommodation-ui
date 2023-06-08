import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'
import ApplyPage from './applyPage'

export default class DtrDetailsPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Provide further details',
      application,
      'accommodation-referral-details',
      'dtr-details',
      paths.applications.pages.show({
        id: application.id,
        task: 'accommodation-referral-details',
        page: 'dtr-submitted',
      }),
    )
  }

  completeForm() {
    this.completeDateInputsFromPageBody('date')
    this.completeTextInputFromPageBody('reference')
  }
}
