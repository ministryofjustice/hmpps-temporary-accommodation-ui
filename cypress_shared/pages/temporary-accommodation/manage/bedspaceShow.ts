import type { Room } from '@approved-premises/api'

import Page from '../../page'

export default class BedspaceShowPage extends Page {
  constructor(private readonly room: Room) {
    super('View a bedspace')
  }

  shouldShowBedspaceDetails(): void {
    cy.get('h2').should('contain', this.room.name)

    this.room.characteristics.forEach(characteristic => {
      cy.get('.govuk-summary-list__key')
        .contains('Attributes')
        .siblings('.govuk-summary-list__value')
        .should('contain', characteristic.name)
    })

    this.room.notes.split('\n').forEach(noteLine => {
      cy.get('.govuk-summary-list__key')
        .contains('Notes')
        .siblings('.govuk-summary-list__value')
        .should('contain', noteLine)
    })
  }

  clickBedspaceEditLink(): void {
    cy.get('a').contains('Edit').click()
  }

  clickBookBedspaceLink(): void {
    cy.get('.moj-identity-bar').within(() => {
      cy.get('button').contains('Actions').click()
      cy.get('a').contains('Book bedspace').click()
    })
  }

  clickVoidBedspaceLink(): void {
    cy.get('.moj-identity-bar').within(() => {
      cy.get('button').contains('Actions').click()
      cy.get('a').contains('Void bedspace').click()
    })
  }
}
