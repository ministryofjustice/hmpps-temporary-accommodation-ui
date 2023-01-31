import type { TemporaryAccommodationPremises as Premises } from '@approved-premises/api'

import Page from '../../page'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import premisesFactory from '../../../../server/testutils/factories/premises'

export default class PremisesListPage extends Page {
  constructor() {
    super('List of properties')
  }

  static visit(): PremisesListPage {
    cy.visit(paths.premises.index({}))
    return new PremisesListPage()
  }

  getAnyPremises(alias: string): void {
    cy.get('table')
      .children('tbody')
      .children('tr')
      .eq(0)
      .get('td')
      .eq(0)
      .then(element => {
        const [addressLine1, postcode] = element.text().split(', ')
        const premises = premisesFactory.build({
          id: 'unknown',
          addressLine1,
          postcode,
        })
        cy.wrap(premises).as(alias)
      })
  }

  getPremises(index: number, alias: string): void {
    cy.get('table')
      .children('tbody')
      .children('tr')
      .eq(index)
      .get('td')
      .eq(0)
      .then(element => {
        const [addressLine1, postcode] = element.text().split(', ')
        const premises = premisesFactory.build({
          id: 'unknown',
          addressLine1,
          postcode,
        })
        cy.wrap(premises).as(alias)
      })
  }

  shouldShowPremises(premises: Array<Premises>): void {
    premises.forEach((item: Premises) => {
      const shortAddress = `${item.addressLine1}, ${item.postcode}`

      cy.contains(shortAddress)
        .parent()
        .within(() => {
          cy.get('td').eq(0).contains(shortAddress)
          cy.get('td').eq(1).contains(item.bedCount)
          cy.get('td').eq(2).contains(item.pdu)
          cy.get('td')
            .eq(3)
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
        cy.get('td').eq(3).contains('Manage').click()
      })
  }
}
