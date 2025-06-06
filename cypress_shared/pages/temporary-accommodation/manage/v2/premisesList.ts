import type {
  TemporaryAccommodationPremises as Premises,
  Cas3PremisesSummary as PremisesSummary,
} from '@approved-premises/api'

import paths from '../../../../../server/paths/temporary-accommodation/manage'
import Page from '../../../page'

export default class PremisesListPage extends Page {
  constructor() {
    super('List of properties')
  }

  static visit(): PremisesListPage {
    cy.visit(paths.premises.v2.index({}))
    return new PremisesListPage()
  }

  shouldShowPremises(premises: Array<PremisesSummary>): void {
    premises.forEach((item: PremisesSummary) => {
      cy.contains(item.addressLine1)
        .contains(item.addressLine2)
        // .contains(item.town)
        .contains(item.postcode)
        .parent()
        .within(() => {
          const addressColumn = cy.get('td').eq(0)
          addressColumn.contains(item.addressLine1)
          if (item.addressLine2 !== undefined) {
            addressColumn.contains(item.addressLine2)
          }
          // addressColumn.contains(item.town)
          addressColumn.contains(item.postcode)

          if (item.bedspaceCount === 0) {
            cy.get('td').eq(1).contains('No bedspaces')
            cy.get('td').eq(1).contains('Add a bedspace')
          } else {
            item.bedspaces.forEach(bedspace => cy.get('td').eq(1).contains(bedspace.reference))
          }

          cy.get('td').eq(2).contains(item.pdu)
          cy.get('td')
            .eq(3)
            .contains('Manage')
            .should('have.attr', 'href', paths.premises.v2.show({ premisesId: item.id }))
        })
    })
  }

  shouldShowOnlyPremises(premises: Array<PremisesSummary>): void {
    cy.get('main table tbody tr').should('have.length', premises.length)
    this.shouldShowPremises(premises)
  }

  clickAddPremisesButton() {
    cy.get('a').contains('Add a property').click()
  }

  clickPremisesViewLink(premises: Premises) {
    cy.contains(premises.addressLine1)
      .contains(premises.addressLine2)
      // .contains(premises.town)
      .contains(premises.postcode)
      .parent()
      .within(() => {
        cy.get('td').eq(3).contains('Manage').click()
      })
  }

  search(query: string) {
    cy.get('main form input').type(query)
    cy.get('main form button').contains('Search').click()
  }

  clearSearch() {
    cy.get('main form a').contains('Clear').click()
  }

  shouldShowMessages(messages: Array<string>) {
    messages.forEach(message => {
      cy.contains(message).should('exist')
    })
  }
}
