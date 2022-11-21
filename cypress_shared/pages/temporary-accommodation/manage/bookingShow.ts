import type { Premises, Room, Booking } from '@approved-premises/api'

import Page from '../../page'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import { DateFormats } from '../../../../server/utils/dateUtils'

export default class BookingShowPage extends Page {
  constructor(private readonly premises: Premises, private readonly room: Room, private readonly booking: Booking) {
    super('View a booking')
  }

  static visit(premises: Premises, room: Room, booking: Booking): BookingShowPage {
    cy.visit(paths.bookings.show({ premisesId: premises.id, roomId: room.id, bookingId: booking.id }))
    return new BookingShowPage(premises, room, booking)
  }

  shouldShowBookingDetails(): void {
    cy.get('.property-identity').within(() => {
      cy.get('p').should('contain', this.room.name)
      cy.get('p').should('contain', this.premises.addressLine1)
      cy.get('p').should('contain', this.premises.postcode)
    })

    cy.get('h2').should('contain', this.booking.person.crn)

    cy.get('.govuk-summary-list__key')
      .contains('Start date')
      .siblings('.govuk-summary-list__value')
      .should('contain', DateFormats.isoDateToUIDate(this.booking.arrivalDate))

    cy.get('.govuk-summary-list__key')
      .contains('End date')
      .siblings('.govuk-summary-list__value')
      .should('contain', DateFormats.isoDateToUIDate(this.booking.departureDate))
  }
}
