import type { FullPerson, TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class PlacementPduPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      `Which PDU (Probation Delivery Unit) should ${(application.person as FullPerson).name} be referred to?`,
      application,
      'placement-location',
      'placement-pdu',
      paths.applications.show({
        id: application.id,
      }),
    )
  }

  completeForm() {
    const pduName = this.tasklistPage.body.pduName as string
    this.completeTextInputByLabel('Enter a PDU in ', pduName.slice(0, 3))
    cy.get('li[role="option"]').contains(pduName).click()
  }
}
