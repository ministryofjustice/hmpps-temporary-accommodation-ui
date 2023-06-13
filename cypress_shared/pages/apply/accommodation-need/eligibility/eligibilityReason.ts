import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class EligibilityReasonPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      `How is ${application.person.name} eligible for Temporary Accommodation (TA)?`,
      application,
      'eligibility',
      'eligibility-reason',
      paths.applications.show({ id: application.id }),
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('reason')
  }
}
