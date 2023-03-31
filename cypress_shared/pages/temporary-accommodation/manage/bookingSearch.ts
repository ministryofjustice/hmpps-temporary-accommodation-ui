import type { Booking, Premises, Room } from '@approved-premises/api'
import Page from '../../page'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import { DateFormats } from '../../../../server/utils/dateUtils'

export default class BookingSearchPage extends Page {
  constructor() {
    super('Find a booking')
  }

  static visit(): BookingSearchPage {
    cy.visit(paths.bookings.search({}))
    return new BookingSearchPage()
  }

  checkBookingDetails(premises: Premises, room: Room, booking: Booking) {
    cy.get('tr')
      .contains(booking.person.crn)
      .parent()
      .within(() => {
        cy.get('td').eq(0).contains(booking.person.name)
        cy.get('td').eq(1).contains(booking.person.crn)
        cy.get('td').eq(2).contains(premises.addressLine1)
        cy.get('td')
          .eq(3)
          .contains(DateFormats.isoDateToUIDate(booking.arrivalDate, { format: 'short' }))
        cy.get('td')
          .eq(4)
          .contains(DateFormats.isoDateToUIDate(booking.departureDate, { format: 'short' }))
        cy.get('td').eq(5).contains('View')
      })
  }

  clickViewBookingLink(crn: string) {
    cy.contains(crn)
      .parent()
      .within(() => {
        cy.get('td').eq(5).contains('View').click()
      })
  }
}
