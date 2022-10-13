import type { Premises } from '@approved-premises/api'

import Page from '../../page'
import paths from '../../../../server/paths/temporary-accommodation/manage'

export default class PremisesListPage extends Page {
  constructor() {
    super('Properties')
  }

  static visit(): PremisesListPage {
    cy.visit(paths.premises.index({}))
    return new PremisesListPage()
  }

  shouldShowPremises(premises: Array<Premises>): void {
    premises.forEach((item: Premises) => {
      cy.contains(item.name)
        .parent()
        .within(() => {
          cy.get('td').eq(0).contains(item.apCode)
          cy.get('td').eq(1).contains(item.bedCount)
          cy.get('td')
            .eq(2)
            .contains('View')
            .should('have.attr', 'href', paths.premises.show({ premisesId: item.id }))
        })
    })
  }

  clickAddPremisesButton() {
    cy.get('a').contains('Add a new property').click()
  }
}
