import type { UpdatePremises, TemporaryAccommodationPremises as Premises } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import { formatStatus } from '../../../../server/utils/premisesUtils'
import PremisesEditablePage from './premisesEditable'

const exact = (text: string) => new RegExp(`^${text}$`)

export default class PremisesEditPage extends PremisesEditablePage {
  constructor(private readonly premises: Premises) {
    super('Edit a property')
  }

  static visit(premises: Premises): PremisesEditPage {
    cy.visit(paths.premises.edit({ premisesId: premises.id }))
    return new PremisesEditPage(premises)
  }

  shouldShowPremisesDetails(): void {
    cy.get('label').contains('Address line 1').siblings('input').should('have.value', this.premises.addressLine1)
    cy.get('label').contains('Address line 2').siblings('input').should('have.value', this.premises.addressLine2)
    cy.get('label').contains('Town or city').siblings('input').should('have.value', this.premises.town)
    cy.get('label').contains('Postcode').siblings('input').should('have.value', this.premises.postcode)

    cy.get('label')
      .contains('What is the local authority (optional)?')
      .siblings('select')
      .children('option')
      .contains(exact(this.premises.localAuthorityArea.name))
      .should('be.selected')

    cy.get('label')
      .contains('What is the probation region?')
      .siblings('select')
      .children('option')
      .contains(exact(this.premises.probationRegion.name))
      .should('be.selected')

    cy.get('label')
      .contains('What is the PDU?')
      .siblings('select')
      .children('option')
      .contains(exact(this.premises.pdu))
      .should('be.selected')

    cy.get('legend')
      .contains('Does the property have any of the following attributes?')
      .parent()
      .within(() => {
        this.premises.characteristics.forEach(characteristic => {
          cy.get('label').contains(characteristic.name).siblings('input').should('be.checked')
        })
      })

    cy.get('legend')
      .contains('What is the status of this property?')
      .parent()
      .within(() => {
        cy.get('label').contains(formatStatus(this.premises.status)).siblings('input').should('be.checked')
      })

    cy.get('label')
      .contains('Please provide any further property details')
      .siblings('textarea')
      .should('contain', this.premises.notes)
  }

  completeForm(updatePremises: UpdatePremises): void {
    this.clearForm()

    super.completeEditableForm(updatePremises)
  }

  clearForm(): void {
    this.getTextInputByIdAndClear('addressLine1')
    this.getTextInputByIdAndClear('addressLine2')
    this.getTextInputByIdAndClear('town')
    this.getTextInputByIdAndClear('postcode')

    this.getSelectInputByIdAndSelectAnEntry('localAuthorityAreaId', '')
    this.getSelectInputByIdAndSelectAnEntry('probationRegionId', '')
    this.getSelectInputByIdAndSelectAnEntry('pdu', '')

    cy.get('legend')
      .contains('Does the property have any of the following attributes?')
      .parent()
      .within(() => {
        cy.get('label').siblings('input').uncheck()
      })

    this.getTextInputByIdAndClear('notes')
  }
}
