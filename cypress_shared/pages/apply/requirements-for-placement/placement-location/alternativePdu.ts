import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class AlternativePduPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Is placement required in an alternative PDU (probation delivery unit)?',
      application,
      'placement-location',
      'alternative-pdu',
      paths.applications.show({
        id: application.id,
      }),
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('alternativePdu')

    if (this.tasklistPage.body.alternativePdu === 'yes') {
      const pduName = this.tasklistPage.body.pduName as string
      this.completeTextInputByLabel('Select a PDU', pduName.slice(0, 3))
      cy.get('li[role="option"]').contains(pduName).click()
    }
  }
}
