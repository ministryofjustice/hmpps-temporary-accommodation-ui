import type { NewRoom, UpdateRoom } from '@approved-premises/api'
import Page from '../../page'

export default abstract class BedspaceEditablePage extends Page {
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

  protected completeEditableForm(newOrUpdateRoom: NewRoom | UpdateRoom): void {
    newOrUpdateRoom.characteristicIds.forEach(characteristicId => {
      this.checkCheckboxByNameAndValue('characteristicIds[]', characteristicId)
    })

    this.getLabel('Please provide any further bedspace details')
    this.getTextInputByIdAndEnterDetails('notes', newOrUpdateRoom.notes)

    this.clickSubmit()
  }
}
