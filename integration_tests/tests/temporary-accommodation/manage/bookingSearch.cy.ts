import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import BookingSearchPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingSearch'
import setupTestUser from '../../../../cypress_shared/utils/setupTestUser'
import { bookingSearchResultsFactory } from '../../../../server/testutils/factories/index'
import Page from '../../../../cypress_shared/pages/page'

context('Booking search', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser()
  })

  it('navigates to the find a provisional booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there are bookings in the database
    const bookings = bookingSearchResultsFactory.build()

    cy.task('stubFindBookings', { bookings, status: 'provisional' })

    // When I visit the dashboard
    const dashboard = DashboardPage.visit()

    // And I click the Find a booking tile
    dashboard.clickFindABookingLink()

    // Then I navigate to the Find a provisional booking page
    const page = Page.verifyOnPage(BookingSearchPage)
    page.checkBookingStatus('provisional')
  })

  it('navigates to the find a booking pages for each status', () => {
    // Given I am signed in
    cy.signIn()

    // And there are bookings of all relevant status types in the database
    const bookings = bookingSearchResultsFactory.build()

    const statuses = ['provisional', 'active', 'closed', 'confirmed']

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
    page.clickOtherBookingStatusLink('active')

    // Then I navigate to the Find an active booking page
    page.checkBookingStatus('active')

    // And I click the Closed bookings link
    page.clickOtherBookingStatusLink('closed')

    // Then I navigate to the Find a closed booking page
    page.checkBookingStatus('closed')
  })

  it('navigates back to the dashboard from the find a booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there are bookings in the database
    const bookings = bookingSearchResultsFactory.build()

    cy.task('stubFindBookings', { bookings, status: 'provisional' })

    // When I visit the Find a booking page
    const page = BookingSearchPage.visit('provisional')

    // And I click the previous bread crumb
    page.clickBreadCrumbUp()

    // Then I navigate to the Dashboard page
    Page.verifyOnPage(DashboardPage)
  })
})
