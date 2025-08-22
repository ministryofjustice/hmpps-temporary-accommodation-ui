import type { NewRoom, UpdateRoom } from '@approved-premises/api'
import Page from '../../page'

export default abstract class BedspaceEditablePage extends Page {
  protected completeEditableForm(newOrUpdateRoom: NewRoom | UpdateRoom): void {
    this.getLabel('Enter a bedspace reference')
    this.getTextInputByIdAndEnterDetails('reference', newOrUpdateRoom.name)

    if (this.bedStartDateIsEditable() && newOrUpdateRoom.bedEndDate) {
      this.getLegend('Enter the bedspace end date (optional)')
      this.completeDateInputs('startDate', newOrUpdateRoom.bedEndDate)
    }

    newOrUpdateRoom.characteristicIds.forEach(characteristicId => {
      this.checkCheckboxByNameAndValue('characteristicIds[]', characteristicId)
    })

    this.getLabel('Additional bedspace details')
    this.getTextInputByIdAndEnterDetails('notes', newOrUpdateRoom.notes)

    this.clickSubmit()
  }

  assignCharacteristics(alias: string): void {
    this.getCheckboxItemsAsReferenceData('Does the bedspace have any of the following details?', alias)
  }

  bedStartDateIsEditable() {
    return Boolean(cy.get('body').then($body => $body.find('input[name^=startDate]').length > 0))
  }
}
