import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class PreviousStaysPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Behaviour in previous accommodation',
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
