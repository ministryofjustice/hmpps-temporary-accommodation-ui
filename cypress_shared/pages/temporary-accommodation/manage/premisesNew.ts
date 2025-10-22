import { Cas3NewPremises } from '@approved-premises/api'
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

  completeForm(newPremises: Cas3NewPremises, localAuthorityName: string): void {
    super.completeEditableForm(newPremises, localAuthorityName)
  }
}
