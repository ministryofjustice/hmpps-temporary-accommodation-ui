import { Cas3NewBedspace } from '@approved-premises/api'
import Page from '../../page'

export default abstract class BedspaceEditablePage extends Page {
  protected completeEditableForm(newOrUpdateBedspace: Cas3NewBedspace): void {
    this.getLabel('Enter a bedspace reference')
    this.getTextInputByIdAndEnterDetails('reference', newOrUpdateBedspace.reference)

    if (this.bedStartDateIsEditable() && newOrUpdateBedspace.startDate) {
      this.getLegend('Enter the bedspace start date')
      this.completeDateInputs('startDate', newOrUpdateBedspace.startDate)
    }

    newOrUpdateBedspace.characteristicIds.forEach(characteristicId => {
      this.checkCheckboxByNameAndValue('characteristicIds[]', characteristicId)
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
