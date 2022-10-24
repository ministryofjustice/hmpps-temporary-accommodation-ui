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

  completeForm(newPremises: NewPremises): void {
    this.getLabel('Property name (optional)')
    this.getTextInputByIdAndEnterDetails('name', newPremises.name)

    this.getLabel('Address line 1')
    this.getTextInputByIdAndEnterDetails('addressLine1', newPremises.addressLine1)

    this.getLabel('Postcode')
    this.getTextInputByIdAndEnterDetails('postcode', newPremises.postcode)

    this.getLabel('What is the local authority?')
    this.getSelectInputByIdAndSelectAnEntry('localAuthorityAreaId', newPremises.localAuthorityAreaId)

    this.getLabel('Please provide any further property details')
    this.getTextInputByIdAndEnterDetails('notes', newPremises.notes)

    this.clickSubmit()
  }
}
