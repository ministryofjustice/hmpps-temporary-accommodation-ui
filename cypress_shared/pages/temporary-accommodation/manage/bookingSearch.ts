import type { Booking, Premises } from '@approved-premises/api'
import type { BookingSearchApiStatus } from '@approved-premises/ui'
import Page from '../../page'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import { DateFormats } from '../../../../server/utils/dateUtils'
import { convertApiStatusToUiStatus } from '../../../../server/utils/bookingSearchUtils'
import { personName } from '../../../../server/utils/personUtils'

export default class BookingSearchPage extends Page {
  constructor() {
    super('View bookings')
  }

  static visit(status: BookingSearchApiStatus): BookingSearchPage {
    cy.visit(paths.bookings.search[status].index({}))
    return new BookingSearchPage()
  }

  checkBookingStatus(status: BookingSearchApiStatus) {
    const uiStatus = convertApiStatusToUiStatus(status)
    const capitalisedStatus = uiStatus.charAt(0).toUpperCase() + uiStatus.slice(1)
    cy.get('h2').contains(`${capitalisedStatus} bookings`)
  }

  checkForPagination() {
    cy.get('nav.govuk-pagination').should('exist')
  }

  checkOrderOfDates(column: number, isAscending: boolean) {
    let prevDate = new Date(`${isAscending ? 1970 : 9999}/01/01`)
    cy.get('tbody >tr').each($item => {
      const myDate = new Date($item.children().eq(column).attr('data-sort-value'))
      if (myDate.valueOf() !== prevDate.valueOf()) {
        expect(myDate > prevDate).to.equal(isAscending)
      }
      prevDate = myDate
    })
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
      .should('have.length.gte', 0)
      .then($row => {
        if ($row.length) {
          cy.wrap($row).children().eq(5).contains('View').click()
          return
        }

        cy.get('.govuk-pagination__next >a').click()
        cy.then(() => {
          this.checkBookingDetailsAndClickView(premises, booking)
        })
      })
  }

  clickOtherBookingStatusLink(status: BookingSearchApiStatus) {
    const uiStatus = convertApiStatusToUiStatus(status)
    const capitalisedStatus = uiStatus.charAt(0).toUpperCase() + uiStatus.slice(1)
    cy.contains(capitalisedStatus).click()
  }
}
