// import type { BookingSearchApiStatus } from '@approved-premises/ui'
// import { BookingSearchResult } from '@approved-premises/api'
// import Page from '../../../../cypress_shared/pages/page'
// import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
// import BookingSearchPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingSearch'
 import { setupTestUser } from '../../../../cypress_shared/utils/setupTestUser'
// import { bookingSearchResultFactory, bookingSearchResultsFactory } from '../../../../server/testutils/factories/index'
// import { MockPagination } from '../../../mockApis/bookingSearch'

context('Booking search', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser('assessor')
  })

  it('navigates to the find a provisional booking page', () => {
    // Given I am signed in
    cy.signIn()
//
//     // And there are bookings in the database
//     const { data: bookings } = bookingSearchResultsFactory.build()
//
//     cy.task('stubFindBookings', { bookings, status: 'provisional' })
//
//     // When I visit the dashboard
//     const dashboard = DashboardPage.visit()
//
//     // And I click the View all bookings tile
//     dashboard.clickViewBookingsLink()
//
//     // Then I navigate to the Find a provisional booking page
//     const page = Page.verifyOnPage(BookingSearchPage)
//     page.checkBookingStatus('provisional')
   })
//
//   it('navigates to the view bookings pages for each status', () => {
//     // Given I am signed in
//     cy.signIn()
//
//     // And there are bookings of all relevant status types in the database
//     const { data: bookings } = bookingSearchResultsFactory.build()
//
//     const statuses: Array<BookingSearchApiStatus> = ['provisional', 'arrived', 'departed', 'confirmed', 'closed']
//
//     statuses.forEach(status => {
//       cy.task('stubFindBookings', { bookings, status })
//     })
//
//     // And I visit the Find a provisional booking page
//     const page = BookingSearchPage.visit('provisional')
//
//     // And I click the Confirmed bookings link
//     page.clickOtherBookingStatusLink('confirmed')
//
//     // Then I navigate to the Find a confirmed booking page
//     page.checkBookingStatus('confirmed')
//
//     // And I click the Active bookings link
//     page.clickOtherBookingStatusLink('arrived')
//
//     // Then I navigate to the Find an active booking page
//     page.checkBookingStatus('arrived')
//
//     // And I click the Departed bookings link
//     page.clickOtherBookingStatusLink('departed')
//
//     // Then I navigate to the Find a departed booking page
//     page.checkBookingStatus('departed')
//   })
//
//   it('orders the results', () => {
//     // Given I am signed in
//     cy.signIn()
//
//     // And there are bookings in the database
//     const { data: bookings } = bookingSearchResultsFactory.build()
//     cy.task('stubFindBookings', { bookings, status: 'provisional' })
//     cy.task('stubFindBookings', { bookings, status: 'provisional', params: { sortBy: 'startDate' } })
//     cy.task('stubFindBookings', {
//       bookings,
//       status: 'provisional',
//       params: { sortBy: 'startDate', sortDirection: 'asc' },
//     })
//
//     // When I visit the Find a provisional booking page
//     const page = BookingSearchPage.visit('provisional')
//
//     // Then I see the results are ordered by End date descending
//     page.checkColumnOrder('End date', 'descending')
//
//     // When I order results by start date
//     page.sortColumn('Start date')
//
//     // Then I see the results are ordered by start date ascending
//     page.shouldHaveURLSearchParam('sortBy=startDate')
//     page.checkColumnOrder('Start date', 'ascending')
//
//     // When I order the results by start date again
//     page.sortColumn('Start date')
//
//     // Then I see the results are ordered by start date descending
//     page.shouldHaveURLSearchParam('sortBy=startDate&sortDirection=desc')
//     page.checkColumnOrder('Start date', 'descending')
//   })
//
//   it('shows the result of a crn or name search and clears the search', () => {
//     // Given I am signed in
//     cy.signIn()
//
//     // And there are bookings in the database
//     const { data: bookings } = bookingSearchResultsFactory.build()
//     const searchedForBooking = bookings[2]
//     const searchCrnOrName = searchedForBooking.person.crn
//
//     cy.task('stubFindBookings', { bookings, status: 'provisional' })
//     cy.task('stubFindBookings', {
//       bookings: [searchedForBooking],
//       status: 'provisional',
//       params: { crnOrName: searchCrnOrName },
//     })
//
//     // When I visit the Find a provisional booking page
//     const page = BookingSearchPage.visit('provisional')
//
//     // Then the search by CRN form is empty
//     page.checkCrnOrNameSearchValue('', 'provisional')
//
//     // And I see all the results
//     page.checkResults(bookings)
//
//     // When I submit a search by CRN or Name
//     page.searchByCrnOrName(searchCrnOrName, 'provisional')
//     Page.verifyOnPage(BookingSearchPage, 'provisional')
//
//     // Then the search by CRN or Name form is populated
//     page.checkCrnOrNameSearchValue(searchCrnOrName, 'provisional')
//
//     // Then I see the search result for that CRN
//     page.checkResults([searchedForBooking])
//
//     // When I clear the search
//     page.clearSearch()
//
//     Page.verifyOnPage(BookingSearchPage, 'provisional')
//
//     // Then the search by CRN or Name form is populated
//     page.checkCrnOrNameSearchValue('', 'provisional')
//
//     // Then I see the search result for that CRN or Name
//     page.checkResults(bookings)
//   })
//
//   it('shows a message if there are no CRN or Name search results', () => {
//     // Given I am signed in
//     cy.signIn()
//
//     // And there are no bookings matching a CRN or Name search in the database
//     const { data: bookings } = bookingSearchResultsFactory.build()
//     const noBookings: BookingSearchResult[] = []
//
//     cy.task('stubFindBookings', { bookings, status: 'confirmed' })
//     cy.task('stubFindBookings', { bookings: noBookings, status: 'confirmed', params: { crnOrName: 'N0M4TCH' } })
//
//     // When I visit the Find a provisional booking page
//     const page = BookingSearchPage.visit('confirmed')
//
//     // Then the search by CRN form is empty
//     page.checkCrnOrNameSearchValue('', 'confirmed')
//
//     // And I see all the results
//     page.checkResults(bookings)
//
//     // When I submit a search by CRN
//     page.searchByCrnOrName('N0M4TCH', 'confirmed')
//     Page.verifyOnPage(BookingSearchPage, 'confirmed')
//
//     // Then the search by CRN form is populated
//     page.checkCrnOrNameSearchValue('N0M4TCH', 'confirmed')
//
//     // Then I see no search results for that CRN
//     page.checkResults(noBookings)
//
//     // And I see a message
//     page.checkNoResultsByCRN('confirmed', 'N0M4TCH')
//   })
//
//   it('retains the CRN search when ordering, paginating and navigating between booking types', () => {
//     // Given I am signed in
//     cy.signIn()
//
//     // And there are bookings in the database
//     const bookings = bookingSearchResultFactory.buildList(23)
//     const pagination: MockPagination = {
//       totalResults: 76,
//       totalPages: 8,
//       pageNumber: 1,
//       pageSize: 10,
//     }
//
//     ;['confirmed', 'arrived', 'departed'].forEach(status => {
//       cy.task('stubFindBookings', { bookings, status })
//       cy.task('stubFindBookings', { bookings, status, params: { crnOrName: 'X321654' } })
//     })
//
//     cy.task('stubFindBookings', { bookings, status: 'provisional', pagination })
//     cy.task('stubFindBookings', { bookings, status: 'provisional', params: { crnOrName: 'X321654' }, pagination })
//     cy.task('stubFindBookings', {
//       bookings,
//       status: 'provisional',
//       params: { crnOrName: 'X321654', sortBy: 'endDate', sortDirection: 'asc' },
//       pagination,
//     })
//     cy.task('stubFindBookings', {
//       bookings,
//       status: 'provisional',
//       params: { crnOrName: 'X321654', sortBy: 'endDate', sortDirection: 'asc', page: 2 },
//       pagination: {
//         ...pagination,
//         pageNumber: 2,
//       },
//     })
//
//     // When I visit the Find a provisional booking page
//     const page = BookingSearchPage.visit('provisional')
//
//     // And I submit a search by CRN or Name
//     page.searchByCrnOrName('X321654', 'provisional')
//
//     // Then I see the provisional bookings for the given CRN or Name
//     Page.verifyOnPage(BookingSearchPage, 'provisional')
//     page.checkCrnOrNameSearchValue('X321654', 'provisional')
//
//     // When I order by end date
//     page.sortColumn('End date')
//
//     // Then I see the provisional bookings for the given CRN or Name
//     page.checkCrnOrNameSearchValue('X321654', 'provisional')
//
//     // And I see the results are ordered by end date ascending
//     page.shouldHaveURLSearchParam('sortBy=endDate&sortDirection=asc')
//     page.checkColumnOrder('End date', 'ascending')
//
//     // When I navigate to the second page of results
//     page.clickPaginationLink(2)
//
//     // Then I see the second page of provisional bookings for the given CRN or Name
//     page.shouldHaveURLSearchParam('page=2')
//     page.checkCrnOrNameSearchValue('X321654', 'provisional')
//
//     // And I see the results are ordered by end date ascending
//     page.shouldHaveURLSearchParam('sortBy=endDate&sortDirection=asc')
//     page.checkColumnOrder('End date', 'ascending')
//
//     // When I navigate to the confirmed bookings search
//     page.clickOtherBookingStatusLink('confirmed')
//
//     // Then I see the confirmed bookings for the given CRN or Name
//     Page.verifyOnPage(BookingSearchPage, 'confirmed')
//     page.checkCrnOrNameSearchValue('X321654', 'confirmed')
//
//     // When I navigate to the active bookings search
//     page.clickOtherBookingStatusLink('arrived')
//
//     // Then I see the active bookings for the given CRN or Name
//     Page.verifyOnPage(BookingSearchPage, 'arrived')
//     page.checkCrnOrNameSearchValue('X321654', 'active')
//
//     // When I navigate to the departed bookings search
//     page.clickOtherBookingStatusLink('departed')
//
//     // Then I see the departed bookings for the given CRN or Name
//     Page.verifyOnPage(BookingSearchPage, 'departed')
//     page.checkCrnOrNameSearchValue('X321654', 'departed')
//
//     // When I navigate to the provisional bookings search
//     page.clickOtherBookingStatusLink('provisional')
//
//     // Then I see the provisional bookings for the given CRN or Name
//     Page.verifyOnPage(BookingSearchPage, 'provisional')
//     page.checkCrnOrNameSearchValue('X321654', 'provisional')
//   })
//
//   it('navigates back to the dashboard from the view bookings page', () => {
//     // Given I am signed in
//     cy.signIn()
//
//     // And there are bookings in the database
//     const { data: bookings } = bookingSearchResultsFactory.build()
//
//     cy.task('stubFindBookings', { bookings, status: 'provisional' })
//
//     // When I visit the View bookings page
//     const page = BookingSearchPage.visit('provisional')
//
//     // And I click the previous bread crumb
//     page.clickBack()
//
//     // Then I navigate to the Dashboard page
//     Page.verifyOnPage(DashboardPage)
//   })
 })
