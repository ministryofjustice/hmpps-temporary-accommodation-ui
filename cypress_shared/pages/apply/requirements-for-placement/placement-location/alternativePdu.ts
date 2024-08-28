import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class AlternativePduPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Is placement required in an alternative PDU (Probation Delivery Unit)?',
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

  checkNotificationBannerHasLinkToExternalGuidance() {
    cy.get('.moj-banner a').should(
      'have.attr',
      'href',
      'https://equip-portal.equip.service.justice.gov.uk/CtrlWebIsapi.dll/app/diagram/0:FF2D8D3F16B44268B814F7F8177A16F7.303E3A0E23194CF082C1598E11FA3314',
    )
  }
}
