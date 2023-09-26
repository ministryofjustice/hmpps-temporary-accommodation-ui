import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'
import { personName } from '../../../../../server/utils/personUtils'

export default class EligibilityReasonPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      `How is ${personName(application.person)} eligible for Transitional Accommodation (CAS3)?`,
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
