import type {
  TemporaryAccommodationPremises as Premises,
  TemporaryAccommodationPremisesSummary as PremisesSummary,
} from '@approved-premises/api'

import paths from '../../../../server/paths/temporary-accommodation/manage'
import { premisesFactory } from '../../../../server/testutils/factories'
import { statusInfo } from '../../../../server/utils/premisesUtils'
import Page from '../../page'

export default class PremisesListPage extends Page {
  constructor() {
    super('List of properties')
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
        return Cypress._.sampleSize(
          items.toArray().filter($item => $item.children[3].textContent === 'Online'),
          count,
        )
      })
      .each((row, index) =>
        cy.wrap(row).within(_row =>
          cy
            .get('td')
            .eq(0)
            .then(element => {
              const [addressLine1, postcode] = element.text().split(', ')
              const premises = premisesFactory.build({
                id: 'unknown',
                addressLine1,
                postcode,
                status: 'active',
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

  shouldShowPremisesForPDU(premises: Array<PremisesSummary>): void {
    premises.forEach((item: PremisesSummary) => {
      const shortAddress = `${item.addressLine1}, ${item.postcode}`

      cy.contains(shortAddress)
        .parent()
        .within(() => {
          cy.get('td').eq(0).contains(shortAddress)
          cy.get('td').eq(1).contains(item.bedCount)
          cy.get('td').eq(2).contains(item.pdu)
          cy.get('td').eq(3).contains(statusInfo(item.status).name)
          cy.get('td')
            .eq(4)
            .contains('Manage')
            .should('have.attr', 'href', paths.premises.show({ premisesId: item.id }))
        })
    })
  }

  shouldShowPremisesForLA(premises: Array<PremisesSummary>): void {
    premises.forEach((item: PremisesSummary) => {
      const shortAddress = `${item.addressLine1}, ${item.postcode}`

      cy.contains(shortAddress)
        .parent()
        .within(() => {
          cy.get('td').eq(0).contains(shortAddress)
          cy.get('td').eq(1).contains(item.bedCount)
          cy.get('td').eq(2).contains(item.localAuthorityAreaName)
          cy.get('td').eq(3).contains(statusInfo(item.status).name)
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
    cy.contains(`${premises.addressLine1}, ${premises.postcode}`)
      .parent()
      .within(() => {
        cy.get('td').eq(4).contains('Manage').click()
      })
  }
}
