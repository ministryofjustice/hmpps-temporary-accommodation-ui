import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class ConsentGivenPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Has consent for Transitional Accommodation been given?',
      application,
      'consent',
      'consent-given',
      paths.applications.show({
        id: application.id,
      }),
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('consentGiven')
  }
}
