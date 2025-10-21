import Page from '../../page'
import { Cas3Bedspace, Cas3Premises } from '../../../../server/@types/shared'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import { convertToTitleCase } from '../../../../server/utils/utils'

export default class BedspaceEditPage extends Page {
  constructor() {
    super('Edit bedspace')
  }

  static visit(premises: Cas3Premises, bedspace: Cas3Bedspace) {
    cy.visit(paths.premises.bedspaces.edit({ premisesId: premises.id, bedspaceId: bedspace.id }))
    return new BedspaceEditPage()
  }

  shouldShowPropertySummary(premises: Cas3Premises) {
    cy.get('dl').contains('Status').siblings('dd').contains(convertToTitleCase(premises.status))
    cy.get('dl')
      .contains('Address')
      .siblings('dd')
      .contains(premises.addressLine1)
      .contains(premises.addressLine2)
      .contains(premises.town)
      .contains(premises.postcode)
  }

  validateEnteredInformation(bedspace: Cas3Bedspace) {
    this.validateEnteredReference(bedspace.reference)
    this.validateEnteredCharacteristics(bedspace.characteristics.map(ch => ch.name))
    this.validateEnteredAdditionalDetails(bedspace.notes)
  }

  clearForm() {
    this.getTextInputByIdAndClear('reference')
    this.getTextInputByIdAndClear('notes')

    cy.get('legend')
      .contains('Select bedspace details')
      .parent()
      .within(() => {
        cy.get('label').siblings('input').uncheck()
      })
  }

  enterReference(reference: string) {
    this.clearTextInputByLabel('Bedspace reference')
    if (reference) {
      this.completeTextInputByLabel('Bedspace reference', reference)
    }
  }

  enterCharacteristics(characteristics: Array<string>) {
    cy.get('legend')
      .contains('Select bedspace details')
      .parent()
      .within(() => {
        characteristics.forEach(characteristic => {
          cy.get('label').contains(characteristic).siblings('input').click()
        })
      })
  }

  enterAdditionalDetails(notes: string) {
    this.completeTextArea('notes', notes)
  }

  validateEnteredReference(reference: string) {
    this.shouldShowTextInputByLabel('Bedspace reference', reference)
  }

  validateEnteredCharacteristics(characteristics: Array<string>) {
    cy.get('legend')
      .contains('Select bedspace details')
      .parent()
      .within(() => {
        characteristics.forEach(characteristic => {
          cy.get('label').contains(characteristic).siblings('input').should('be.checked')
        })
      })
  }

  validateEnteredAdditionalDetails(notes: string) {
    this.shouldShowTextareaInput('notes', notes)
  }
}
