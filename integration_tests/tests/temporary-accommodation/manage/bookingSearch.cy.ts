import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import BookingSearchPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingSearch'
import setupTestUser from '../../../../cypress_shared/utils/setupTestUser'
import bookingSearchResultsFactory from '../../../../server/testutils/factories/bookingSearchResults'
import Page from '../../../../cypress_shared/pages/page'

context('Booking search', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser()
  })

  it('navigates to the find a booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there are bookings in the database
    const bookings = bookingSearchResultsFactory.build()

    cy.task('stubFindBookings', { bookings })

    // When I visit the dashboard
    const dashboard = DashboardPage.visit()

    // And I click the Find a booking tile
    dashboard.clickFindABookingLink()

    // Then I navigate to the Find a booking page
    Page.verifyOnPage(BookingSearchPage)
  })

  it('navigates back to the dashboard from the find a booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there are bookings in the database
    const bookings = bookingSearchResultsFactory.build()

    cy.task('stubFindBookings', { bookings })

    // When I visit the Find a booking page
    const page = BookingSearchPage.visit()

    // And I click the previous bread crumb
    page.clickBreadCrumbUp()

    // Then I navigate to the Dashboard page
    Page.verifyOnPage(DashboardPage)
  })
})
