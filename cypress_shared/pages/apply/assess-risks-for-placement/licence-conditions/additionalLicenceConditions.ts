import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class AdditionalLicenceConditionsPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Additional licence conditions',
      application,
      'licence-conditions',
      'additional-licence-conditions',
      paths.applications.show({ id: application.id }),
    )
  }

  completeForm() {
    this.checkCheckboxesWithDetailsFromPageBody('conditions')
  }
}
