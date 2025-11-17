import { Cas3NewPremises, Cas3Premises, Cas3UpdatePremises } from '@approved-premises/api'
import Page from '../../page'

export default class PremisesEditablePage extends Page {
  constructor(pageTitle: string) {
    super(pageTitle)
  }

  validateEnteredInformation(premises: Cas3Premises) {
    this.validateEnteredReference(premises.reference)
    this.validateEnteredAddress(premises)
    this.validateEnteredLocalAuthority(premises.localAuthorityArea.name)
    this.validateEnteredPdu(premises.probationDeliveryUnit.name)
    this.validateEnteredCharacteristics(premises.premisesCharacteristics.map(ch => ch.description))
    this.validateEnteredAdditionalDetails(premises.notes)
  }

  clearForm(): void {
    this.getTextInputByIdAndClear('reference')
    this.getTextInputByIdAndClear('addressLine1')
    this.getTextInputByIdAndClear('addressLine2')
    this.getTextInputByIdAndClear('town')
    this.getTextInputByIdAndClear('postcode')
    this.getTextInputByIdAndClear('localAuthorityAreaId')

    this.getSelectInputByIdAndSelectAnEntry('probationRegionId', '')
    this.getSelectInputByIdAndSelectAnEntry('probationDeliveryUnitId', 'Select a PDU')

    cy.get('legend')
      .contains('Does the property have any of the following attributes?')
      .parent()
      .within(() => {
        cy.get('label').siblings('input').uncheck()
      })

    this.getTextInputByIdAndClear('notes')
    this.getTextInputByIdAndClear('turnaroundWorkingDays')
  }

  enterReference(reference: string): void {
    const field = cy.get('main .govuk-form-group input#reference')
    field.clear()
    if (reference) {
      field.type(reference)
    }
  }

  enterAddress(addressLine1: string, addressLine2: string, town: string, postcode: string): void {
    cy.get('main .govuk-form-group input#addressLine1').clear()
    cy.get('main .govuk-form-group input#addressLine2').clear()
    cy.get('main .govuk-form-group input#town').clear()
    cy.get('main .govuk-form-group input#postcode').clear()

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
    cy.get('main .govuk-form-group input#localAuthorityAreaId').clear()
    cy.get('main .govuk-form-group input#localAuthorityAreaId').type(localAuthority)
    cy.get('main .govuk-form-group .autocomplete__wrapper ul li')
      .contains(new RegExp(`^${localAuthority}$`))
      .click()
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
    cy.get('main .govuk-form-group textarea#notes').clear().type(notes)
  }

  enterWorkingDays(workingDays: number): void {
    cy.get('main .govuk-form-group input#turnaroundWorkingDays').clear().type(`${workingDays}`)
  }

  validateEnteredReference(reference: string): void {
    cy.get('main .govuk-form-group input#reference').should('contain.value', reference)
  }

  validateEnteredAddress(premises: Cas3Premises) {
    this.validateEnteredAddressLine1(premises.addressLine1)
    this.validateEnteredAddressLine2(premises.addressLine2)
    this.validateEnteredTown(premises.town)
    this.validateEnteredPostcode(premises.postcode)
  }

  validateEnteredAddressLine1(addressLine1: string): void {
    cy.get('main .govuk-form-group input#addressLine1').should('contain.value', addressLine1)
  }

  validateEnteredAddressLine2(addressLine2: string): void {
    cy.get('main .govuk-form-group input#addressLine2').should('contain.value', addressLine2)
  }

  validateEnteredTown(town: string): void {
    cy.get('main .govuk-form-group input#town').should('contain.value', town)
  }

  validateEnteredPostcode(postcode: string) {
    cy.get('main .govuk-form-group input#postcode').should('contain.value', postcode)
  }

  validateEnteredLocalAuthority(localAuthority: string): void {
    cy.get('main .govuk-form-group select#localAuthorityAreaId-select option')
      .contains(localAuthority)
      .should('be.selected')
  }

  validateEnteredRegion() {
    cy.get('main .govuk-form-group select#probationRegionId option').eq(1).should('be.selected')
  }

  validateEnteredPdu(pdu: string) {
    cy.get('main .govuk-form-group select#probationDeliveryUnitId').contains(pdu).should('be.selected')
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

  protected completeEditableForm(
    newOrUpdatePremises: Cas3NewPremises | Cas3UpdatePremises,
    localAuthorityName: string,
  ): void {
    this.getLabel('Enter a property reference')
    this.getTextInputByIdAndEnterDetails('reference', newOrUpdatePremises.reference)

    this.getLabel('Address line 1')
    this.getTextInputByIdAndEnterDetails('addressLine1', newOrUpdatePremises.addressLine1)

    this.getLabel('Address line 2 (optional)')
    this.getTextInputByIdAndEnterDetails('addressLine2', newOrUpdatePremises.addressLine2)

    this.getLabel('Town or city (optional)')
    this.getTextInputByIdAndEnterDetails('town', newOrUpdatePremises.town)

    this.getLabel('Postcode')
    this.getTextInputByIdAndEnterDetails('postcode', newOrUpdatePremises.postcode)

    this.getLabel('What is the local authority?')
    this.getTextInputByIdAndEnterDetails('localAuthorityAreaId', localAuthorityName)

    newOrUpdatePremises.characteristicIds.forEach(characteristicId => {
      this.checkCheckboxByNameAndValue('characteristicIds[]', characteristicId)
    })

    this.getLabel('What is the region?')
    this.getSelectInputByIdAndSelectAnEntry('probationRegionId', newOrUpdatePremises.probationRegionId)

    this.getLabel('What is the PDU?')
    this.getSelectInputByIdAndSelectAnEntry('probationDeliveryUnitId', newOrUpdatePremises.probationDeliveryUnitId)

    this.getLabel('Additional property details')
    this.getTextInputByIdAndEnterDetails('notes', newOrUpdatePremises.notes)

    this.getLabel(
      'Enter the number of working days required to turnaround the property. The standard turnaround time should be 2 days',
    )
    this.getTextInputByIdAndClear('turnaroundWorkingDays')
    this.getTextInputByIdAndEnterDetails('turnaroundWorkingDays', `${newOrUpdatePremises.turnaroundWorkingDays}`)

    this.clickSubmit()
  }

  assignPdus(alias: string): void {
    this.getSelectOptionsAsReferenceData('What is the PDU?', alias)
  }

  assignLocalAuthorities(alias: string): void {
    this.getSelectOptionsAsReferenceData('What is the local authority?', alias)
  }

  assignCharacteristics(alias: string): void {
    this.getCheckboxItemsAsReferenceData('Does the property have any of the following attributes?', alias)
  }
}
