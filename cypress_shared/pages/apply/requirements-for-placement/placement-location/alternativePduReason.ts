import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class AlternativePduReasonPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Provide a reason for choosing a different PDU (probation delivery unit)',
      application,
      'placement-location',
      'alternative-pdu-reason',
      paths.applications.show({
        id: application.id,
      }),
    )
  }

  completeForm() {
    this.completeTextInputFromPageBody('reason')
  }
}
