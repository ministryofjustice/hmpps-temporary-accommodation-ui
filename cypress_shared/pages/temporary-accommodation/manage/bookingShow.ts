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
    cy.get('.location-header').within(() => {
      cy.get('p').should('contain', this.booking.person.crn)
      cy.get('p').should('contain', this.room.name)
      cy.get('p').should('contain', this.premises.addressLine1)
      cy.get('p').should('contain', this.premises.postcode)
    })

    this.shouldShowKeyAndValue('Start date', DateFormats.isoDateToUIDate(this.booking.arrivalDate))
    this.shouldShowKeyAndValue('End date', DateFormats.isoDateToUIDate(this.booking.departureDate))

    if (this.booking.status === 'provisional') {
      this.shouldShowKeyAndValue('Status', 'Provisional')
    } else if (this.booking.status === 'confirmed') {
      this.shouldShowKeyAndValue('Status', 'Confirmed')
      this.shouldShowKeyAndValues('Notes', this.booking.confirmation.notes.split('\n'))
    }
  }
}
