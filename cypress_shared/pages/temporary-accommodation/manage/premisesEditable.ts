import type { NewPremises, UpdatePremises } from '@approved-premises/api'
import Page from '../../page'

export default abstract class PremisesEditablePage extends Page {
  protected completeEditableForm(newOrUpdatePremises: NewPremises | UpdatePremises): void {
    this.getLabel('Enter a property reference')
    this.getTextInputByIdAndEnterDetails('name', newOrUpdatePremises.name)

    this.getLabel('Address line 1')
    this.getTextInputByIdAndEnterDetails('addressLine1', newOrUpdatePremises.addressLine1)

    this.getLabel('Address line 2 (optional)')
    this.getTextInputByIdAndEnterDetails('addressLine2', newOrUpdatePremises.addressLine2)

    this.getLabel('Town or city (optional)')
    this.getTextInputByIdAndEnterDetails('town', newOrUpdatePremises.town)

    this.getLabel('Postcode')
    this.getTextInputByIdAndEnterDetails('postcode', newOrUpdatePremises.postcode)

    this.getLabel('What is the local authority (optional)?')
    this.getSelectInputByIdAndSelectAnEntry('localAuthorityAreaId', newOrUpdatePremises.localAuthorityAreaId)

    newOrUpdatePremises.characteristicIds.forEach(characteristicId => {
      this.checkCheckboxByNameAndValue('characteristicIds[]', characteristicId)
    })

    this.getLabel('What is the probation region?')
    this.getSelectInputByIdAndSelectAnEntry('probationRegionId', newOrUpdatePremises.probationRegionId)

    this.getLabel('What is the PDU?')
    this.getSelectInputByIdAndSelectAnEntry('probationDeliveryUnitId', newOrUpdatePremises.probationDeliveryUnitId)

    this.getLegend('What is the status of this property?')
    this.checkRadioByNameAndValue('status', newOrUpdatePremises.status)

    this.getLabel('Please provide any further property details')
    this.getTextInputByIdAndEnterDetails('notes', newOrUpdatePremises.notes)

    this.getLabel(
      'Enter the number of working days required to turnaround the property. The standard turnaround time should be 2 days',
    )
    this.getTextInputByIdAndClear('turnaroundWorkingDayCount')
    this.getTextInputByIdAndEnterDetails(
      'turnaroundWorkingDayCount',
      `${newOrUpdatePremises.turnaroundWorkingDayCount}`,
    )

    this.clickSubmit()
  }

  assignPdus(alias: string): void {
    this.getSelectOptionsAsReferenceData('What is the PDU?', alias)
  }

  assignLocalAuthorities(alias: string): void {
    this.getSelectOptionsAsReferenceData('What is the local authority (optional)?', alias)
  }

  assignCharacteristics(alias: string): void {
    this.getCheckboxItemsAsReferenceData('Does the property have any of the following attributes?', alias)
  }
}
