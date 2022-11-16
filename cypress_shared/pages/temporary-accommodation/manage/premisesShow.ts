import type { Premises, Room } from '@approved-premises/api'

import Page from '../../page'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import { formatStatus } from '../../../../server/utils/premisesUtils'

export default class PremisesShowPage extends Page {
  constructor(private readonly premises: Premises) {
    super('View a property')
  }

  static visit(premises: Premises): PremisesShowPage {
    cy.visit(paths.premises.show({ premisesId: premises.id }))
    return new PremisesShowPage(premises)
  }

  shouldShowPremisesDetails(): void {
    cy.get('h2').should('contain', `${this.premises.addressLine1}, ${this.premises.postcode}`)

    cy.get(`[data-cy-premises]`).within(() => {
      cy.get('h3').should('contain', this.premises.name)

      cy.get('.govuk-summary-list__key')
        .contains('Address')
        .siblings('.govuk-summary-list__value')
        .should('contain', this.premises.addressLine1)
        .should('contain', this.premises.postcode)

      cy.get('.govuk-summary-list__key')
        .contains('Local authority')
        .siblings('.govuk-summary-list__value')
        .should('contain', this.premises.localAuthorityArea.name)

      this.premises.characteristics.forEach(characteristic => {
        cy.get('.govuk-summary-list__key')
          .contains('Attributes')
          .siblings('.govuk-summary-list__value')
          .should('contain', characteristic.name)
      })

      cy.get('.govuk-summary-list__key')
        .contains('Status')
        .siblings('.govuk-summary-list__value')
        .should('contain', formatStatus(this.premises.status))

      this.premises.notes.split('\n').forEach(noteLine => {
        cy.get('.govuk-summary-list__key')
          .contains('Notes')
          .siblings('.govuk-summary-list__value')
          .should('contain', noteLine)
      })
    })
  }

  shouldShowRoomDetails(room: Room): void {
    cy.get('h4')
      .contains(room.name)
      .parents('[data-cy-bedspace]')
      .within(() => {
        room.characteristics.forEach(characteristic => {
          cy.get('.govuk-summary-list__key')
            .contains('Attributes')
            .siblings('.govuk-summary-list__value')
            .should('contain', characteristic.name)
        })

        room.notes.split('\n').forEach(noteLine => {
          cy.get('.govuk-summary-list__key')
            .contains('Notes')
            .siblings('.govuk-summary-list__value')
            .should('contain', noteLine)
        })
      })
  }

  clickAddBedspaceLink(): void {
    cy.get('.moj-identity-bar').within(() => {
      cy.get('button').contains('Actions').click()
      cy.get('a').contains('Add a bedspace').click()
    })
  }

  clickPremisesEditLink(): void {
    cy.get(`[data-cy-premises]`).within(() => {
      cy.get('a').contains('Edit').click()
    })
  }

  clickBedpaceViewLink(room: Room): void {
    cy.get('h4')
      .contains(room.name)
      .parents('[data-cy-bedspace]')
      .within(() => {
        cy.get('a').contains('View').click()
      })
  }
}
