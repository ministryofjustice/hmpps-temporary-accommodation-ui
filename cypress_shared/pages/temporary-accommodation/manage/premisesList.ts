import type { TemporaryAccommodationPremises as Premises } from '@approved-premises/api'

import paths from '../../../../server/paths/temporary-accommodation/manage'
import { cas3PremisesFactory } from '../../../../server/testutils/factories'
import Page from '../../page'

export default class PremisesListPage extends Page {
  constructor() {
    super('Online properties')
  }

  static visit(): PremisesListPage {
    cy.visit(paths.premises.index({}))
    return new PremisesListPage()
  }

  sampleActivePremises(count: number, alias: string): void {
    cy.get('table')
      .children('tbody')
      .children('tr')
      .then(items => {
        return Cypress._.sampleSize(items.toArray(), count)
      })
      .each((row, index) =>
        cy.wrap(row).within(_row =>
          cy
            .get('td')
            .eq(0)
            .then(element => {
              const [addressLine1] = element.text().split(', ')
              const premises = cas3PremisesFactory.build({
                id: 'unknown',
                addressLine1,
                status: 'online',
              })

              if (index === 0) {
                cy.wrap([premises]).as(alias)
              } else {
                cy.then(function _() {
                  const samples = this[alias]
                  cy.wrap([...samples, premises]).as(alias)
                })
              }
            }),
        ),
      )
  }

  clickAddPremisesButton() {
    cy.get('a').contains('Add a property').click()
  }

  clickPremisesViewLink(premises: Premises) {
    cy.contains(`${premises.addressLine1}`)
      .parent()
      .within(() => {
        cy.get('td').eq(3).contains('Manage').click()
      })
  }
}
