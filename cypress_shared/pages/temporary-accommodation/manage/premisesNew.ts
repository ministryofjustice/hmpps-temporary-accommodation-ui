import type { NewPremises } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import PremisesEditablePage from './premisesEditable'

export default class PremisesNewPage extends PremisesEditablePage {
  constructor() {
    super('Add a property')
  }

  static visit(): PremisesNewPage {
    cy.visit(paths.premises.new({}))
    return new PremisesNewPage()
  }

  completeForm(newPremises: NewPremises): void {
    this.getLabel('Property name')
    this.getTextInputByIdAndEnterDetails('name', newPremises.name)

    super.completeEditableForm(newPremises)
  }
}
