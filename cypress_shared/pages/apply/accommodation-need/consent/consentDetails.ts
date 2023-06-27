import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class ConsentDetailsPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'How was consent given?',
      application,
      'consent',
      'consent-details',
      paths.applications.pages.show({
        id: application.id,
        task: 'consent',
        page: 'consent-given',
      }),
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('consentType')

    if (this.tasklistPage.body.consentType === 'other') {
      this.completeTextInputFromPageBody('consentTypeDetail')
    }
  }
}
