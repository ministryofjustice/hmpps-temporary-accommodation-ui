import type { Booking, BookingSearchResult, Premises } from '@approved-premises/api'
import type { BookingSearchApiStatus } from '@approved-premises/ui'
import Page from '../../page'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import { DateFormats } from '../../../../server/utils/dateUtils'
import { capitaliseStatus } from '../../../../server/utils/bookingSearchUtils'
import { personName } from '../../../../server/utils/personUtils'
import { supportEmail } from '../../../../server/utils/phaseBannerUtils'

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

  checkForPagination() {
    cy.get('nav.moj-pagination').should('exist')
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

        cy.get('.moj-pagination__item--next >a').click()
        cy.then(() => {
          this.checkBookingDetailsAndClickView(premises, booking)
        })
      })
  }

  clickOtherBookingStatusLink(status: BookingSearchApiStatus) {
    cy.contains(capitaliseStatus(status)).click()
  }

  checkCRNSearchValue(value: string, status: string) {
    this.shouldShowTextInputByLabel(`Search ${status} bookings by CRN (case reference number)`, value)
  }

  checkResults(bookings: BookingSearchResult[]) {
    cy.get('main table tbody tr').should('have.length', bookings.length)
    bookings.forEach(result => {
      cy.get('main table tbody').should('contain', result.person.crn)
    })
  }

  searchByCRN(crn: string, status: string) {
    this.completeTextInputByLabel(`Search ${status} bookings by CRN (case reference number)`, crn)
    this.clickSubmit('Search')
  }

  clearSearch() {
    cy.get('a').contains('Clear').click()
  }

  checkNoResults(status: string) {
    cy.get('main table').should('not.exist')
    cy.get('p').should('contain', `There are no ${status} bookings to show.`)
  }

  checkNoResultsByCRN(status: string, crn: string) {
    cy.get('main table').should('not.exist')
    cy.get('h2').should('contain', `There are no results for ‘${crn}’ in ${status} bookings.`)
    cy.get('p').should('contain', 'Check the other lists.')
    cy.get('main a').contains('contact support').should('have.attr', 'href', `mailto:${supportEmail}`)
  }
}
