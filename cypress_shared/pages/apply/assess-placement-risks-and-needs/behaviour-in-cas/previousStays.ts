import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

import { personName } from '../../../../../server/utils/personUtils'

export default class PreviousStaysPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      `Has ${personName(application.person)} previously stayed in Community Accommodation Services (CAS)?`,
      application,
      'behaviour-in-cas',
      'previous-stays',
      paths.applications.show({ id: application.id }),
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('previousStays')
  }
}
