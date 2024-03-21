import type { NewRoom, UpdateRoom } from '@approved-premises/api'
import Page from '../../page'

export default abstract class BedspaceEditablePage extends Page {
  protected completeEditableForm(newOrUpdateRoom: NewRoom | UpdateRoom): void {
    this.getLabel('Enter a bedspace reference')
    this.getTextInputByIdAndEnterDetails('name', newOrUpdateRoom.name)

    this.getLegend('Enter the bedspace end date (optional)')
    this.completeDateInputs('bedEndDate', newOrUpdateRoom.bedEndDate)

    newOrUpdateRoom.characteristicIds.forEach(characteristicId => {
      this.checkCheckboxByNameAndValue('characteristicIds[]', characteristicId)
    })

    this.getLabel('Please provide any further bedspace details')
    this.getTextInputByIdAndEnterDetails('notes', newOrUpdateRoom.notes)

    this.clickSubmit()
  }

  assignCharacteristics(alias: string): void {
    this.getCheckboxItemsAsReferenceData('Does the bedspace have any of the following attributes?', alias)
  }
}
