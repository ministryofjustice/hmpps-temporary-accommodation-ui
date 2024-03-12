import type { BookingSearchApiStatus } from '@approved-premises/ui'
import { BookingSearchResult } from '@approved-premises/api'
import Page from '../../../../cypress_shared/pages/page'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import BookingSearchPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingSearch'
import { setupTestUser } from '../../../../cypress_shared/utils/setupTestUser'
import { bookingSearchResultFactory, bookingSearchResultsFactory } from '../../../../server/testutils/factories/index'
import { MockPagination } from '../../../mockApis/bookingSearch'

context('Booking search', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser('assessor')
  })

  it('navigates to the find a provisional booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there are bookings in the database
    const { data: bookings } = bookingSearchResultsFactory.build()

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
    const { data: bookings } = bookingSearchResultsFactory.build()

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

  it('orders the results', () => {
    // Given I am signed in
    cy.signIn()

    // And there are bookings in the database
    const { data: bookings } = bookingSearchResultsFactory.build()
    cy.task('stubFindBookings', { bookings, status: 'provisional' })
    cy.task('stubFindBookings', { bookings, status: 'provisional', params: { sortBy: 'startDate' } })
    cy.task('stubFindBookings', {
      bookings,
      status: 'provisional',
      params: { sortBy: 'startDate', sortDirection: 'asc' },
    })

    // When I visit the Find a provisional booking page
    const page = BookingSearchPage.visit('provisional')

    // And I order results by start date
    page.sortColumn('Start date')

    // Then I see the results are ordered by start date descending
    page.checkUrl('sortBy=startDate')
    page.checkColumnOrder('Start date', 'descending')

    // When I order the results by start date again
    page.sortColumn('Start date')

    // Then I see the results are ordered by start date ascending
    page.checkUrl('sortBy=startDate&sortDirection=asc')
    page.checkColumnOrder('Start date', 'ascending')
  })

  it('shows the result of a crn search and clears the search', () => {
    // Given I am signed in
    cy.signIn()

    // And there are bookings in the database
    const { data: bookings } = bookingSearchResultsFactory.build()
    const searchedForBooking = bookings[2]
    const searchCRN = searchedForBooking.person.crn

    cy.task('stubFindBookings', { bookings, status: 'provisional' })
    cy.task('stubFindBookings', { bookings: [searchedForBooking], status: 'provisional', params: { crn: searchCRN } })

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
    page.checkResults([searchedForBooking])

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
    const { data: bookings } = bookingSearchResultsFactory.build()
    const noBookings: BookingSearchResult[] = []

    cy.task('stubFindBookings', { bookings, status: 'confirmed' })
    cy.task('stubFindBookings', { bookings: noBookings, status: 'confirmed', params: { crn: 'N0M4TCH' } })

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

  it('shows a message if the user has entered a blank CRN', () => {
    // Given I am signed in
    cy.signIn()

    // And there are bookings in the database
    const { data: bookings } = bookingSearchResultsFactory.build()

    cy.task('stubFindBookings', { bookings, status: 'provisional' })

    // When I visit the Find a provisional booking page
    const page = BookingSearchPage.visit('provisional')

    // And I submit a search with a blank CRN
    page.searchByCRN('  ', 'provisional')
    Page.verifyOnPage(BookingSearchPage, 'provisional')

    // Then I see an error message
    page.checkNoCRNEntered()
  })

  it('retains the CRN search when ordering, paginating and navigating between booking types', () => {
    // Given I am signed in
    cy.signIn()

    // And there are bookings in the database
    const bookings = bookingSearchResultFactory.buildList(23)
    const pagination: MockPagination = {
      totalResults: 76,
      totalPages: 8,
      pageNumber: 1,
      pageSize: 10,
    }

    ;['confirmed', 'arrived', 'departed'].forEach(status => {
      cy.task('stubFindBookings', { bookings, status })
      cy.task('stubFindBookings', { bookings, status, params: { crn: 'X321654' } })
    })

    cy.task('stubFindBookings', { bookings, status: 'provisional', pagination })
    cy.task('stubFindBookings', { bookings, status: 'provisional', params: { crn: 'X321654' }, pagination })
    cy.task('stubFindBookings', {
      bookings,
      status: 'provisional',
      params: { crn: 'X321654', sortBy: 'endDate', sortDirection: 'asc' },
      pagination,
    })
    cy.task('stubFindBookings', {
      bookings,
      status: 'provisional',
      params: { crn: 'X321654', sortBy: 'endDate', sortDirection: 'asc', page: 2 },
      pagination: {
        ...pagination,
        pageNumber: 2,
      },
    })

    // When I visit the Find a provisional booking page
    const page = BookingSearchPage.visit('provisional')

    // And I submit a search by CRN
    page.searchByCRN('X321654', 'provisional')

    // Then I see the provisional bookings for the given CRN
    Page.verifyOnPage(BookingSearchPage, 'provisional')
    page.checkCRNSearchValue('X321654', 'provisional')

    // When I order by end date
    page.sortColumn('End date')

    // Then I see the provisional bookings for the given CRN
    page.checkCRNSearchValue('X321654', 'provisional')

    // And I see the results are ordered by end date ascending
    page.checkUrl('sortBy=endDate&sortDirection=asc')
    page.checkColumnOrder('End date', 'ascending')

    // When I navigate to the second page of results
    page.clickPageLink(2)

    // Then I see the second page of provisional bookings for the given CRN
    page.checkUrl('page=2')
    page.checkCRNSearchValue('X321654', 'provisional')

    // And I see the results are ordered by end date ascending
    page.checkUrl('sortBy=endDate&sortDirection=asc')
    page.checkColumnOrder('End date', 'ascending')

    // When I navigate to the confirmed bookings search
    page.clickOtherBookingStatusLink('confirmed')

    // Then I see the confirmed bookings for the given CRN
    Page.verifyOnPage(BookingSearchPage, 'confirmed')
    page.checkCRNSearchValue('X321654', 'confirmed')

    // When I navigate to the active bookings search
    page.clickOtherBookingStatusLink('arrived')

    // Then I see the active bookings for the given CRN
    Page.verifyOnPage(BookingSearchPage, 'arrived')
    page.checkCRNSearchValue('X321654', 'active')

    // When I navigate to the departed bookings search
    page.clickOtherBookingStatusLink('departed')

    // Then I see the departed bookings for the given CRN
    Page.verifyOnPage(BookingSearchPage, 'departed')
    page.checkCRNSearchValue('X321654', 'departed')

    // When I navigate to the provisional bookings search
    page.clickOtherBookingStatusLink('provisional')

    // Then I see the provisional bookings for the given CRN
    Page.verifyOnPage(BookingSearchPage, 'provisional')
    page.checkCRNSearchValue('X321654', 'provisional')
  })

  it('navigates back to the dashboard from the view bookings page', () => {
    // Given I am signed in
    cy.signIn()

    // And there are bookings in the database
    const { data: bookings } = bookingSearchResultsFactory.build()

    cy.task('stubFindBookings', { bookings, status: 'provisional' })

    // When I visit the View bookings page
    const page = BookingSearchPage.visit('provisional')

    // And I click the previous bread crumb
    page.clickBreadCrumbUp()

    // Then I navigate to the Dashboard page
    Page.verifyOnPage(DashboardPage)
  })
})
