import type { Booking, BookingSearchResults, Premises } from '@approved-premises/api'
import type { BookingSearchApiStatus } from '@approved-premises/ui'
import Page from '../../page'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import { DateFormats } from '../../../../server/utils/dateUtils'
import { capitaliseStatus } from '../../../../server/utils/bookingSearchUtils'
import { personName } from '../../../../server/utils/personUtils'

export default class BookingSearchPage extends Page {
  constructor(status: BookingSearchApiStatus = 'provisional') {
    const title = `${capitaliseStatus(status)} bookings`
    super(title)
  }

  static visit(status: BookingSearchApiStatus): BookingSearchPage {
    cy.visit(paths.bookings.search[status].index({}))
    return new BookingSearchPage(status)
  }

  checkBookingStatus(status: BookingSearchApiStatus) {
    const displayStatus = `${capitaliseStatus(status)} bookings`
    cy.get('.moj-sub-navigation a[aria-current="page"]').contains(displayStatus)
  }

  checkBookingDetailsAndClickView(premises: Premises, booking: Booking) {
    cy.get('tr')
      .filter(
        `:contains(${personName(booking.person, 'Limited access offender')}):contains(${booking.person.crn}):contains(${
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

  clickOtherBookingStatusLink(status: BookingSearchApiStatus) {
    cy.contains(capitaliseStatus(status)).click()
  }

  checkCRNSearchValue(value: string) {
    this.shouldShowTextInputByLabel('Search bookings by CRN (case reference number)', value)
  }

  checkResults(bookings: BookingSearchResults) {
    cy.get('main table tbody tr').should('have.length', bookings.resultsCount)
    bookings.results.forEach(result => {
      cy.get('main table tbody').should('contain', result.person.crn)
    })
  }

  searchByCRN(crn: string) {
    this.completeTextInputByLabel('Search bookings by CRN (case reference number)', crn)
    this.clickSubmit('Search')
  }
}
