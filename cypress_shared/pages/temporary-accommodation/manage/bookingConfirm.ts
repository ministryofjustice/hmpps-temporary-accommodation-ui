import type { Booking, Premises, Room } from '@approved-premises/api'

import paths from '../../../../server/paths/temporary-accommodation/manage'
import Page from '../../page'

export default class BookingConfirmPage extends Page {
  constructor(private readonly premises: Premises, private readonly room: Room, private readonly booking?: Booking) {
    super('Confirm CRN')
  }

  static visit(premises: Premises, room: Room, booking: Booking): BookingConfirmPage {
    cy.visit(paths.bookings.confirm({ premisesId: premises.id, roomId: room.id }))
    return new BookingConfirmPage(premises, room, booking)
  }

  shouldShowBookingDetails(): void {
    cy.get('.location-header').within(() => {
      if (this.booking) {
        cy.get('p').should('contain', this.booking.person.crn)
      }
      cy.get('p').should('contain', this.room.name)
      cy.get('p').should('contain', this.premises.addressLine1)
      cy.get('p').should('contain', this.premises.postcode)
    })
  }
}
