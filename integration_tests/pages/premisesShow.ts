import { parseISO } from 'date-fns'

import type { Premises, Booking } from 'approved-premises'

import Page from './page'

export default class PremisesShowPage extends Page {
  constructor(private readonly premises: Premises) {
    super(premises.name)
  }

  static visit(premises: Premises): PremisesShowPage {
    cy.visit(`/premises/${premises.id}`)
    return new PremisesShowPage(premises)
  }

  shouldShowPremisesDetail(): void {
    cy.get('.govuk-summary-list__key')
      .contains('Code')
      .siblings('.govuk-summary-list__value')
      .should('contain', this.premises.apCode)

    cy.get('.govuk-summary-list__key')
      .contains('Postcode')
      .siblings('.govuk-summary-list__value')
      .should('contain', this.premises.postcode)

    cy.get('.govuk-summary-list__key')
      .contains('Number of Beds')
      .siblings('.govuk-summary-list__value')
      .should('contain', this.premises.bedCount)
  }

  shouldShowBookings(bookings: Array<Booking>): void {
    bookings.forEach((item: Booking) => {
      const arrivalDate = parseISO(item.arrivalDate)
      cy.contains(item.CRN)
        .parent()
        .within(() => {
          cy.get('td').eq(0).contains(arrivalDate.toLocaleDateString('en-GB'))
          cy.get('td')
            .eq(1)
            .contains('Manage')
            .should('have.attr', 'href', `/premises/${this.premises.id}/bookings/${item.id}/arrivals/new`)
        })
    })
  }
}
