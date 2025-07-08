import type { Cas3Premises, Cas3PremisesSearchResult, Cas3PremisesSortBy } from '@approved-premises/api'

import paths from '../../../../../server/paths/temporary-accommodation/manage'
import Page from '../../../page'

export default class PremisesListPage extends Page {
  constructor(pageTitle = 'Online properties') {
    super(pageTitle)
  }

  static visit(): PremisesListPage {
    cy.visit(paths.premises.v2.index({}))
    return new PremisesListPage()
  }

  static visitOnline(): PremisesListPage {
    cy.visit(paths.premises.v2.online({}))
    return new PremisesListPage()
  }

  static visitArchived(): PremisesListPage {
    cy.visit(paths.premises.v2.archived({}))
    return new PremisesListPage('Archived properties')
  }

  shouldShowPremises(premises: Array<Cas3PremisesSearchResult>, sortBy: Cas3PremisesSortBy = 'pdu'): void {
    premises.forEach((item: Cas3PremisesSearchResult) => {
      cy.contains(item.addressLine1)
        .contains(item.addressLine2)
        .contains(item.town)
        .contains(item.postcode)
        .parent()
        .within(() => {
          const addressColumn = cy.get('td').eq(0)
          addressColumn.contains(item.addressLine1)
          if (item.addressLine2 !== undefined) {
            addressColumn.contains(item.addressLine2)
          }
          addressColumn.contains(item.town)
          addressColumn.contains(item.postcode)

          if (item.bedspaces.length === 0) {
            cy.get('td').eq(1).contains('No bedspaces')
            cy.get('td').eq(1).contains('Add a bedspace')
          } else {
            item.bedspaces.forEach(bedspace => cy.get('td').eq(1).contains(bedspace.reference))
          }

          cy.get('td')
            .eq(2)
            .contains(sortBy === 'pdu' ? item.pdu : item.localAuthorityAreaName)
          cy.get('td').eq(3).contains('Manage').should('have.attr', 'href', `/v2/properties/${item.id}`)
        })
    })
  }

  shouldShowOnlyPremises(premises: Array<Cas3PremisesSearchResult>): void {
    cy.get('main table tbody tr').should('have.length', premises.length)
    this.shouldShowPremises(premises)
  }

  search(query: string) {
    cy.get('main form input').type(query)
    cy.get('main form button').contains('Search').click()
  }

  clearSearch() {
    cy.get('main form input').clear()
    cy.get('main form button').contains('Search').click()
  }

  shouldShowMessages(messages: Array<string>) {
    messages.forEach(message => {
      cy.contains(message).should('exist')
    })
  }

  clickBedspaceReference(reference: string): void {
    cy.get('main table tbody a').contains(reference).click()
  }

  toggleSortBy() {
    cy.get('[data-cy="toggle-sort"]').click()
  }

  shouldShowSortByHeader(text: string) {
    cy.get('[data-cy="sort-by-header"]').should('contain', text)
  }

  clickPremisesManageLink(premises: Cas3Premises): void {
    cy.get('main table tbody td').contains(premises.addressLine1).contains('Manage').click()
  }
}
