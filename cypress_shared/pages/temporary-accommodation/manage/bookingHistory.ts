import type { Booking, Premises, Room } from '@approved-premises/api'

import Page from '../../page'
import BookingInfoComponent from '../../../components/bookingInfo'
import paths from '../../../../server/paths/temporary-accommodation/manage'

export default class BookingHistoryPage extends Page {
  private readonly bookingInfoComponents: BookingInfoComponent[]

  constructor(
    private readonly premises: Premises,
    private readonly room: Room,
    private readonly booking: Booking,
    historicBookings: Booking[],
  ) {
    super('Booking history')

    this.bookingInfoComponents = historicBookings.map(historicBooking => new BookingInfoComponent(historicBooking))
  }

  static visit(premises: Premises, room: Room, booking: Booking, bookings: Booking[]): BookingHistoryPage {
    cy.visit(paths.bookings.history({ premisesId: premises.id, roomId: room.id, bookingId: booking.id }))
    return new BookingHistoryPage(premises, room, booking, bookings)
  }

  shouldShowBookingHistory(): void {
    cy.get('.location-header').within(() => {
      cy.get('p').should('contain', this.booking.person.crn)
      cy.get('p').should('contain', this.room.name)
      cy.get('p').should('contain', this.premises.addressLine1)
      cy.get('p').should('contain', this.premises.postcode)
    })

    this.bookingInfoComponents.forEach((bookingInfoComponent, index) => {
      cy.get(`[data-cy-history-index="${index}"]`).within(() => {
        bookingInfoComponent.shouldShowBookingDetails()
      })
    })
  }
}
