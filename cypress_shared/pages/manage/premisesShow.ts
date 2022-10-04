import type { Premises, Booking } from 'approved-premises'

import Page from '../page'
import paths from '../../../server/paths/manage'
import { DateFormats } from '../../../server/utils/dateUtils'

export default class PremisesShowPage extends Page {
  constructor(private readonly premises: Premises) {
    super(premises.name)
  }

  static visit(premises: Premises): PremisesShowPage {
    cy.visit(paths.premises.show({ premisesId: premises.id }))
    return new PremisesShowPage(premises)
  }

  clickLostBedsOption() {
    cy.get('.moj-button-menu__toggle-button')
      .click()
      .then(() => cy.get('a').contains('Record a lost bed').click())
  }

  clickCreateBookingOption() {
    cy.get('.moj-button-menu__toggle-button')
      .click()
      .then(() => cy.get('a').contains('Create a booking').click())
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

    cy.get('.govuk-summary-list__key')
      .contains('Available Beds')
      .siblings('.govuk-summary-list__value')
      .should('contain', this.premises.availableBedsForToday)
  }

  shouldShowBookings(
    bookingsArrivingToday: Array<Booking>,
    bookingsLeavingToday: Array<Booking>,
    bookingsArrivingSoon: Array<Booking>,
    bookingsLeavingSoon: Array<Booking>,
  ): void {
    cy.get('a')
      .contains('Arriving Today')
      .click()
      .then(() => {
        this.tableShouldContainBookings(bookingsArrivingToday, 'arrival')
      })

    cy.get('a')
      .contains('Departing Today')
      .click()
      .then(() => {
        this.tableShouldContainBookings(bookingsLeavingToday, 'departure')
      })

    cy.get('a')
      .contains('Upcoming Arrivals')
      .click()
      .then(() => {
        this.tableShouldContainBookings(bookingsArrivingSoon, 'arrival')
      })

    cy.get('a')
      .contains('Upcoming Departures')
      .click()
      .then(() => {
        this.tableShouldContainBookings(bookingsLeavingSoon, 'departure')
      })
  }

  private tableShouldContainBookings(bookings: Array<Booking>, type: 'arrival' | 'departure') {
    bookings.forEach((item: Booking) => {
      const date = type === 'arrival' ? item.arrivalDate : item.departureDate
      cy.contains(item.person.crn)
        .parent()
        .within(() => {
          cy.get('td').eq(0).contains(DateFormats.isoDateToUIDate(date))
          cy.get('td')
            .eq(1)
            .contains('Manage')
            .should('have.attr', 'href', paths.bookings.show({ premisesId: this.premises.id, bookingId: item.id }))
        })
    })
  }

  shouldShowCurrentResidents(currentResidents: Array<Booking>) {
    cy.get('h2').should('contain', 'Current Residents')
    currentResidents.forEach((item: Booking) => {
      cy.contains(item.person.crn)
        .parent()
        .within(() => {
          cy.get('td').eq(0).contains(DateFormats.isoDateToUIDate(item.departureDate))
          cy.get('td')
            .eq(1)
            .contains('Manage')
            .should('have.attr', 'href', paths.bookings.show({ premisesId: this.premises.id, bookingId: item.id }))
        })
    })
  }

  shouldShowOvercapacityMessage(overcapacityStartDate: string, overcapacityEndDate: string) {
    this.shouldShowBanner(
      `The premises is over capacity for the period ${DateFormats.isoDateToUIDate(
        overcapacityStartDate,
      )} to ${DateFormats.isoDateToUIDate(overcapacityEndDate)}`,
    )
  }
}
