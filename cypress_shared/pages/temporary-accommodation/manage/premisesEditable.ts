import type { Cas3NewPremises, Cas3UpdatePremises } from '@approved-premises/api'
import Page from '../../page'

export default abstract class PremisesEditablePage extends Page {
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

    // FIXME: This type guard and conditional in next method should be removed once the Cas3NewPremises and
    //  Cas3UpdatePremises types are aligned on the turnaroundWorkingDays field
    const isUpdatePremises = (entity?: Cas3UpdatePremises | Cas3NewPremises): entity is Cas3UpdatePremises =>
      'turnaroundWorkingDayCount' in (entity as Cas3UpdatePremises)
    this.getTextInputByIdAndEnterDetails(
      'turnaroundWorkingDays',
      `${isUpdatePremises(newOrUpdatePremises) ? newOrUpdatePremises.turnaroundWorkingDayCount : newOrUpdatePremises.turnaroundWorkingDays}`,
    )

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
