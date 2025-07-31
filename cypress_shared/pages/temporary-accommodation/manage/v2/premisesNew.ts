import paths from '../../../../../server/paths/temporary-accommodation/manage'
import PremisesEditablePage from './premisesEditable'

export default class PremisesNewPage extends PremisesEditablePage {
  constructor() {
    super('Add a property')
  }

  static visit(): PremisesNewPage {
    cy.visit(paths.premises.v2.new({}))
    return new PremisesNewPage()
  }
}
