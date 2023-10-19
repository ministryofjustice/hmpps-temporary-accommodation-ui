import type { NewPremises, ProbationRegion } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import { exact } from '../../../../server/utils/utils'
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
    super.completeEditableForm(newPremises)
  }

  shouldPreselectProbationRegion(probationRegion: ProbationRegion): void {
    cy.get('label')
      .contains('What is the probation region?')
      .siblings('select')
      .children('option')
      .should('have.length', 2)
      .contains(exact(probationRegion.name))
      .should('be.selected')
  }
}
