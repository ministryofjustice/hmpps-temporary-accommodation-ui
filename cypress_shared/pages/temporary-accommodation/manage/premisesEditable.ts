import type { NewPremises, UpdatePremises } from '@approved-premises/api'
import Page from '../../page'

export default abstract class PremisesEditablePage extends Page {
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

    this.getLabel('What is the probation region?')
    this.getSelectInputByIdAndSelectAnEntry('probationRegionId', newOrUpdatePremises.probationRegionId)

    this.getLabel('What is the PDU?')
    this.getSelectInputByIdAndSelectAnEntry('pdu', newOrUpdatePremises.pdu)

    this.getLegend('What is the status of this property?')
    this.checkRadioByNameAndValue('status', newOrUpdatePremises.status)

    this.getLabel('Please provide any further property details')
    this.getTextInputByIdAndEnterDetails('notes', newOrUpdatePremises.notes)

    this.clickSubmit()
  }
}
