import type { Premises, Room, Booking } from '@approved-premises/api'

import Page from '../../page'
import BookingInfoComponent from '../../../components/bookingInfo'

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
