import { Cas3Premises, Cas3PremisesSearchResult, Cas3PremisesSortBy } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import { cas3PremisesFactory } from '../../../../server/testutils/factories'
import Page from '../../page'

export default class PremisesListPage extends Page {
  constructor(pageTitle = 'Online properties') {
    super(pageTitle)
  }

  static visit(): PremisesListPage {
    cy.visit(paths.premises.index({}))
    return new PremisesListPage()
  }

  static visitOnline(): PremisesListPage {
    cy.visit(paths.premises.online({}))
    return new PremisesListPage()
  }

  static visitArchived(): PremisesListPage {
    cy.visit(paths.premises.archived({}))
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
          cy.get('td').eq(3).contains('Manage').should('have.attr', 'href', `/properties/${item.id}`)
        })
    })
  }

  shouldShowArchivedPremises(premises: Array<Cas3PremisesSearchResult>, sortBy: Cas3PremisesSortBy = 'pdu'): void {
    premises.forEach((item: Cas3PremisesSearchResult) => {
      cy.contains(item.addressLine1)
        .contains(item.addressLine2)
        .contains(item.town)
        .contains(item.postcode)
        .contains('Archived')
        .parent()
        .parent()
        .within(() => {
          if (item.bedspaces.length === 0) {
            cy.get('td').eq(1).contains('No bedspaces')
          } else if (item.bedspaces.length === 1) {
            cy.get('td').eq(1).contains('1 bedspace')
          } else {
            cy.get('td').eq(1).contains(`${item.bedspaces.length} bedspaces`)
          }

          cy.get('td')
            .eq(2)
            .contains(sortBy === 'pdu' ? item.pdu : item.localAuthorityAreaName)
          cy.get('td').eq(3).contains('Manage').should('have.attr', 'href', `/properties/${item.id}`)
        })
    })
  }

  shouldShowOnlyPremises(premises: Array<Cas3PremisesSearchResult>): void {
    cy.get('main table tbody tr').should('have.length', premises.length)
    this.shouldShowPremises(premises)
  }

  shouldShowOnlyArchivedPremises(premises: Array<Cas3PremisesSearchResult>): void {
    cy.get('main table tbody tr').should('have.length', premises.length)
    this.shouldShowArchivedPremises(premises)
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

  clickAddPropertyButton(): void {
    cy.get('main .moj-cas-page-header-actions a').contains('Add a property').click()
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

  clickPremisesViewLink(premises: Cas3Premises) {
    cy.contains(`${premises.addressLine1}`)
      .parent()
      .within(() => {
        cy.get('td').eq(3).contains('Manage').click()
      })
  }
}
