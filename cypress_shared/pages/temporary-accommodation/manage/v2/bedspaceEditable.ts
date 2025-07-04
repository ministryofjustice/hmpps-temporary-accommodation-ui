import type { Cas3NewBedspace } from '@approved-premises/api'
import Page from '../../../page'

export default abstract class BedspaceEditablePage extends Page {
  protected completeEditableForm(newBedspace: Cas3NewBedspace): void {
    this.getLabel('Enter a bedspace reference')
    this.getTextInputByIdAndEnterDetails('reference', newBedspace.reference)

    this.getLegend('Enter the bedspace start date')
    this.completeDateInputs('startDate', newBedspace.startDate)

    newBedspace.characteristicIds.forEach(characteristicId => {
      this.checkCheckboxByNameAndValue('characteristicIds[]', characteristicId)
    })

    if (newBedspace.notes) {
      this.getLabel('Additional bedspace details')
      this.getTextInputByIdAndEnterDetails('notes', newBedspace.notes)
    }

    this.clickSubmit()
  }

  assignCharacteristics(alias: string): void {
    this.getCheckboxItemsAsReferenceData('Does the bedspace have any of the following attributes?', alias)
  }
}
