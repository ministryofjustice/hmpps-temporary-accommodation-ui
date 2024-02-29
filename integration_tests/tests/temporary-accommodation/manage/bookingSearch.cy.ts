import type { BookingSearchApiStatus } from '@approved-premises/ui'
import { BookingSearchResults } from '@approved-premises/api'
import Page from '../../../../cypress_shared/pages/page'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import BookingSearchPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingSearch'
import { setupTestUser } from '../../../../cypress_shared/utils/setupTestUser'
import { bookingSearchResultsFactory } from '../../../../server/testutils/factories/index'

context('Booking search', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser('assessor')
  })

  it('navigates to the find a provisional booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there are bookings in the database
    const bookings = bookingSearchResultsFactory.build()

    cy.task('stubFindBookings', { bookings, status: 'provisional' })

    // When I visit the dashboard
    const dashboard = DashboardPage.visit()

    // And I click the View all bookings tile
    dashboard.clickViewBookingsLink()

    // Then I navigate to the Find a provisional booking page
    const page = Page.verifyOnPage(BookingSearchPage)
    page.checkBookingStatus('provisional')
  })

  it('navigates to the view bookings pages for each status', () => {
    // Given I am signed in
    cy.signIn()

    // And there are bookings of all relevant status types in the database
    const bookings = bookingSearchResultsFactory.build()

    const statuses: Array<BookingSearchApiStatus> = ['provisional', 'arrived', 'departed', 'confirmed', 'closed']

    statuses.forEach(status => {
      cy.task('stubFindBookings', { bookings, status })
    })

    // And I visit the Find a provisional booking page
    const page = BookingSearchPage.visit('provisional')

    // And I click the Confirmed bookings link
    page.clickOtherBookingStatusLink('confirmed')

    // Then I navigate to the Find a confirmed booking page
    page.checkBookingStatus('confirmed')

    // And I click the Active bookings link
    page.clickOtherBookingStatusLink('arrived')

    // Then I navigate to the Find an active booking page
    page.checkBookingStatus('arrived')

    // And I click the Departed bookings link
    page.clickOtherBookingStatusLink('departed')

    // Then I navigate to the Find a departed booking page
    page.checkBookingStatus('departed')
  })

  it('shows the result of a crn search and clears the search', () => {
    // Given I am signed in
    cy.signIn()

    // And there are bookings in the database
    const bookings = bookingSearchResultsFactory.build()
    const searchedForBooking: BookingSearchResults = { results: [bookings.results[2]], resultsCount: 1 }
    const searchCRN = searchedForBooking.results[0].person.crn

    cy.task('stubFindBookings', { bookings, status: 'provisional' })
    cy.task('stubFindBookingsByCRN', { bookings: searchedForBooking, status: 'provisional', crn: searchCRN })

    // When I visit the Find a provisional booking page
    const page = BookingSearchPage.visit('provisional')

    // Then the search by CRN form is empty
    page.checkCRNSearchValue('', 'provisional')

    // And I see all the results
    page.checkResults(bookings)

    // When I submit a search by CRN
    page.searchByCRN(searchCRN, 'provisional')
    Page.verifyOnPage(BookingSearchPage, 'provisional')

    // Then the search by CRN form is populated
    page.checkCRNSearchValue(searchCRN, 'provisional')

    // Then I see the search result for that CRN
    page.checkResults(searchedForBooking)

    // When I clear the search
    page.clearSearch()

    Page.verifyOnPage(BookingSearchPage, 'provisional')

    // Then the search by CRN form is populated
    page.checkCRNSearchValue('', 'provisional')

    // Then I see the search result for that CRN
    page.checkResults(bookings)
  })

  it('shows a message if there are no CRN search results', () => {
    // Given I am signed in
    cy.signIn()

    // And there are no bookings matching a CRN search in the database
    const bookings = bookingSearchResultsFactory.build()
    const noBookings = { results: [], resultsCount: 0 }

    cy.task('stubFindBookings', { bookings, status: 'confirmed' })
    cy.task('stubFindBookingsByCRN', {
      bookings: noBookings,
      status: 'confirmed',
      crn: 'N0M4TCH',
    })

    // When I visit the Find a provisional booking page
    const page = BookingSearchPage.visit('confirmed')

    // Then the search by CRN form is empty
    page.checkCRNSearchValue('', 'confirmed')

    // And I see all the results
    page.checkResults(bookings)

    // When I submit a search by CRN
    page.searchByCRN('N0M4TCH', 'confirmed')
    Page.verifyOnPage(BookingSearchPage, 'confirmed')

    // Then the search by CRN form is populated
    page.checkCRNSearchValue('N0M4TCH', 'confirmed')

    // Then I see no search results for that CRN
    page.checkResults(noBookings)

    // And I see a message
    page.checkNoResultsByCRN('confirmed', 'N0M4TCH')
  })

  it('shows an error message if the user has not entered a CRN', () => {
    // Given I am signed in
    cy.signIn()

    // And there are bookings in the database
    const bookings = bookingSearchResultsFactory.build()

    cy.task('stubFindBookings', { bookings, status: 'provisional' })

    // When I visit the Find a provisional booking page
    const page = BookingSearchPage.visit('provisional')

    // And I submit a search with a blank CRN
    page.searchByCRN('  ', 'provisional')
    Page.verifyOnPage(BookingSearchPage, 'provisional')

    // Then I see an error message
    page.shouldShowErrorMessagesForFields(['crn'])
  })

  it('navigates back to the dashboard from the view bookings page', () => {
    // Given I am signed in
    cy.signIn()

    // And there are bookings in the database
    const bookings = bookingSearchResultsFactory.build()

    cy.task('stubFindBookings', { bookings, status: 'provisional' })

    // When I visit the View bookings page
    const page = BookingSearchPage.visit('provisional')

    // And I click the previous bread crumb
    page.clickBreadCrumbUp()

    // Then I navigate to the Dashboard page
    Page.verifyOnPage(DashboardPage)
  })
})
