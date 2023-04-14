import type { Booking, Premises } from '@approved-premises/api'
import type { BookingSearchApiStatus, BookingSearchUiStatus } from '@approved-premises/ui'
import Page from '../../page'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import { DateFormats } from '../../../../server/utils/dateUtils'

export default class BookingSearchPage extends Page {
  constructor() {
    super('View bookings')
  }

  static visit(status: BookingSearchApiStatus): BookingSearchPage {
    cy.visit(paths.bookings.search[status].index({}))
    return new BookingSearchPage()
  }

  checkBookingStatus(status: BookingSearchUiStatus) {
    const capitalisedStatus = status.charAt(0).toUpperCase() + status.slice(1)
    cy.get('h2').contains(`${capitalisedStatus} bookings`)
  }

  checkBookingDetailsAndClickView(premises: Premises, booking: Booking) {
    cy.get('tr')
      .filter(
        `:contains(${booking.person.name}):contains(${booking.person.crn}):contains(${
          premises.addressLine1
        }):contains(${DateFormats.isoDateToUIDate(booking.arrivalDate, {
          format: 'short',
        })}):contains(${DateFormats.isoDateToUIDate(booking.departureDate, { format: 'short' })})`,
      )
      .children()
      .eq(5)
      .contains('View')
      .click()
  }

  clickOtherBookingStatusLink(status: BookingSearchUiStatus) {
    const capitalisedStatus = status.charAt(0).toUpperCase() + status.slice(1)
    cy.contains(capitalisedStatus).click()
  }
}
