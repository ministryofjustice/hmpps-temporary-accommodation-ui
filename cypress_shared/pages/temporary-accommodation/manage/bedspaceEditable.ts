import Page from '../../page'
import { Cas3Bedspace } from '../../../../server/@types/shared'

export default abstract class BedspaceEditablePage extends Page {
  protected completeEditableForm(newOrUpdateBedspace: Cas3Bedspace): void {
    this.getLabel('Enter a bedspace reference')
    this.getTextInputByIdAndEnterDetails('reference', newOrUpdateBedspace.reference)

    if (this.bedStartDateIsEditable() && newOrUpdateBedspace.endDate) {
      this.getLegend('Enter the bedspace end date (optional)')
      this.completeDateInputs('startDate', newOrUpdateBedspace.endDate)
    }

    newOrUpdateBedspace.characteristics.forEach(characteristic => {
      this.checkCheckboxByNameAndValue('characteristicIds[]', characteristic.id)
    })

    this.getLabel('Additional bedspace details')
    this.getTextInputByIdAndEnterDetails('notes', newOrUpdateBedspace.notes)

    this.clickSubmit()
  }

  assignCharacteristics(alias: string): void {
    this.getCheckboxItemsAsReferenceData('Does the bedspace have any of the following details?', alias)
  }

  bedStartDateIsEditable() {
    return Boolean(cy.get('body').then($body => $body.find('input[name^=startDate]').length > 0))
  }
}
