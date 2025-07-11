import Page from '../../../page'

import paths from '../../../../../server/paths/temporary-accommodation/manage'

export default class PremisesNewPage extends Page {
  constructor(pageTitle = 'Add a property') {
    super(pageTitle)
  }

  static visit(): PremisesNewPage {
    cy.visit(paths.premises.v2.new({}))
    return new PremisesNewPage()
  }

  enterReference(reference: string): void {
    cy.get('main .govuk-form-group input#reference').type(reference)
  }

  enterAddress(addressLine1: string, addressLine2: string, town: string, postcode: string): void {
    if (addressLine1) {
      cy.get('main .govuk-form-group input#addressLine1').type(addressLine1)
    }
    cy.get('main .govuk-form-group input#addressLine2').type(addressLine2)
    cy.get('main .govuk-form-group input#town').type(town)
    if (postcode) {
      cy.get('main .govuk-form-group input#postcode').type(postcode)
    }
  }

  enterLocalAuthority(localAuthority: string): void {
    cy.get('main .govuk-form-group input#localAuthorityAreaId').type(localAuthority)
    cy.get('main .govuk-form-group .autocomplete__wrapper ul li').contains(localAuthority).click()
  }

  enterProbationRegion(): void {
    cy.get('main .govuk-form-group select#probationRegionId').select(1)
  }

  enterPdu(pdu: string): void {
    cy.get('main .govuk-form-group select#probationDeliveryUnitId').select(pdu)
  }

  enterCharacteristics(characteristics: Array<string>): void {
    cy.get('main .govuk-form-group legend')
      .contains('Does the property have any of the following attributes?')
      .parent()
      .within(() => {
        characteristics.forEach(characteristic => {
          cy.get('label').contains(characteristic).siblings('input').click()
        })
      })
  }

  enterAdditionalDetails(notes: string): void {
    cy.get('main .govuk-form-group textarea#notes').type(notes)
  }

  enterWorkingDays(workingDays: number): void {
    cy.get('main .govuk-form-group input#turnaroundWorkingDays').type(`${workingDays}`)
  }

  validateEnteredAddressLine2(addressLine2: string): void {
    cy.get('main .govuk-form-group input#addressLine2').should('contain.value', addressLine2)
  }

  validateEnteredTown(town: string): void {
    cy.get('main .govuk-form-group input#town').should('contain.value', town)
  }

  validateEnteredLocalAuthority(localAuthority: string): void {
    cy.get('main .govuk-form-group select#localAuthorityAreaId-select option')
      .contains(localAuthority)
      .should('be.selected')
  }

  validateEnteredCharacteristics(characteristics: Array<string>): void {
    cy.get('main .govuk-form-group legend')
      .contains('Does the property have any of the following attributes?')
      .parent()
      .within(() => {
        characteristics.forEach(characteristic => {
          cy.get('label').contains(characteristic).siblings('input').should('be.checked')
        })
      })
  }

  validateEnteredAdditionalDetails(notes: string): void {
    cy.get('main .govuk-form-group textarea#notes').contains(notes)
  }

  validateEnteredWorkingDays(workingDays: number): void {
    cy.get('main .govuk-form-group input#turnaroundWorkingDays').should('contain.value', `${workingDays}`)
  }
}
