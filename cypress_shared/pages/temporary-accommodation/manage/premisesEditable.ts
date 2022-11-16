import type { NewPremises, UpdatePremises } from '@approved-premises/api'
import Page from '../../page'

export default abstract class PremisesEditablePage extends Page {
  getLocalAuthorityAreaIdByLabel(label: string, alias: string): void {
    cy.get('select[name="localAuthorityAreaId"').within(() => {
      cy.get('option')
        .contains(label)
        .then(element => {
          cy.wrap(element.attr('value')).as(alias)
        })
    })
  }

  getCharacteristicIdByLabel(label: string, alias: string): void {
    cy.get('input[name="characteristicIds[]"')
      .siblings('label')
      .within(() => {
        cy.contains(label)
          .siblings('input')
          .then(inputElement => {
            cy.wrap(inputElement.attr('value')).as(alias)
          })
      })
  }

  protected completeEditableForm(newOrUpdatePremises: NewPremises | UpdatePremises): void {
    this.getLabel('Address line 1')
    this.getTextInputByIdAndEnterDetails('addressLine1', newOrUpdatePremises.addressLine1)

    this.getLabel('Postcode')
    this.getTextInputByIdAndEnterDetails('postcode', newOrUpdatePremises.postcode)

    this.getLabel('What is the local authority?')
    this.getSelectInputByIdAndSelectAnEntry('localAuthorityAreaId', newOrUpdatePremises.localAuthorityAreaId)

    newOrUpdatePremises.characteristicIds.forEach(characteristicId => {
      this.checkCheckboxByNameAndValue('characteristicIds[]', characteristicId)
    })

    this.getLegend('What is the status of this property?')
    this.checkRadioByNameAndValue('status', newOrUpdatePremises.status)

    this.getLabel('Please provide any further property details')
    this.getTextInputByIdAndEnterDetails('notes', newOrUpdatePremises.notes)

    this.clickSubmit()
  }
}
