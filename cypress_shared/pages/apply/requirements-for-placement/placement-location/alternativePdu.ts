import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class AlternativePduPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Is placement required in an alternative PDU?',
      application,
      'placement-location',
      'alternative-pdu',
      paths.applications.show({
        id: application.id,
      }),
    )
  }

  completeForm() {
    this.completeYesNoInputWithDetailFromPageBody('alternativePdu')
  }
}
