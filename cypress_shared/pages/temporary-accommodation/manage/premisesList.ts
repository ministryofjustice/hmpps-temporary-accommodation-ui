import type { Premises } from '@approved-premises/ui'

import Page from '../../page'
import paths from '../../../../server/paths/temporary-accommodation/manage'

export default class PremisesListPage extends Page {
  constructor() {
    super('List of properties')
  }

  static visit(): PremisesListPage {
    cy.visit(paths.premises.index({}))
    return new PremisesListPage()
  }

  shouldShowPremises(premises: Array<Premises>): void {
    premises.forEach((item: Premises) => {
      const shortAddress = `${item.address}, ${item.postcode}`

      cy.contains(shortAddress)
        .parent()
        .within(() => {
          cy.get('td').eq(0).contains(shortAddress)
          cy.get('td').eq(1).contains(item.bedCount)
          cy.get('td')
            .eq(4)
            .contains('Manage')
            .should('have.attr', 'href', paths.premises.show({ premisesId: item.id }))
        })
    })
  }

  clickAddPremisesButton() {
    cy.get('a').contains('Add a property').click()
  }

  clickPremisesViewLink(premises: Premises) {
    cy.contains(`${premises.address}, ${premises.postcode}`)
      .parent()
      .within(() => {
        cy.get('td').eq(4).contains('Manage').click()
      })
  }
}
