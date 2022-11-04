import type { NewPremises } from '@approved-premises/api'
import Page from '../../page'
import paths from '../../../../server/paths/temporary-accommodation/manage'

export default class PremisesNewPage extends Page {
  constructor() {
    super('Add a property')
  }

  static visit(): PremisesNewPage {
    cy.visit(paths.premises.new({}))
    return new PremisesNewPage()
  }

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

  completeForm(newPremises: NewPremises): void {
    this.getLabel('Property name (optional)')
    this.getTextInputByIdAndEnterDetails('name', newPremises.name)

    this.getLabel('Address line 1')
    this.getTextInputByIdAndEnterDetails('addressLine1', newPremises.addressLine1)

    this.getLabel('Postcode')
    this.getTextInputByIdAndEnterDetails('postcode', newPremises.postcode)

    this.getLabel('What is the local authority?')
    this.getSelectInputByIdAndSelectAnEntry('localAuthorityAreaId', newPremises.localAuthorityAreaId)

    newPremises.characteristicIds.forEach(characteristicId => {
      this.checkCheckboxByNameAndValue('characteristicIds[]', characteristicId)
    })

    this.getLabel('Please provide any further property details')
    this.getTextInputByIdAndEnterDetails('notes', newPremises.notes)

    this.clickSubmit()
  }
}
