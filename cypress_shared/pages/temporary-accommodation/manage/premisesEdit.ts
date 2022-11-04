import type { UpdatePremises, Premises } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import PremisesEditablePage from './premisesEditable'

export default class PremisesEditPage extends PremisesEditablePage {
  constructor(private readonly premises: Premises) {
    super('Edit a property')
  }

  completeForm(updatePremises: UpdatePremises): void {
    this.clearForm()

    super.completeEditableForm(updatePremises)
  }

  clearForm(): void {
    this.getTextInputByIdAndClear('addressLine1')
    this.getTextInputByIdAndClear('postcode')

    this.getSelectInputByIdAndSelectAnEntry('localAuthorityAreaId', '')

    cy.get('legend')
      .contains('Does the premises have any of the following attributes?')
      .parent()
      .within(() => {
        cy.get('label').siblings('input').uncheck()
      })

    this.getTextInputByIdAndClear('notes')
  }
}
