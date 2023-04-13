import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import BookingSearchPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingSearch'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'

Given(`I'm searching bookings`, () => {
  cy.then(function _() {
    cy.visit('/')
    const dashboardPage = Page.verifyOnPage(DashboardPage)
    dashboardPage.clickViewBookingsLink()
  })
})

Then('I should see a summary of the booking on the provisional bookings page', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage)
    bookingSearchPage.checkBookingStatus('provisional')

    bookingSearchPage.checkBookingDetailsAndClickView(this.premises, this.booking)
  })
})

Then('I should see a summary of the booking on the confirmed bookings page', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage)
    bookingSearchPage.checkBookingStatus('provisional')

    bookingSearchPage.clickOtherBookingStatusLink('confirmed')
    bookingSearchPage.checkBookingStatus('confirmed')

    bookingSearchPage.checkBookingDetailsAndClickView(this.premises, this.booking)
  })
})

Then('I should see a summary of the booking on the active bookings page', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage)
    bookingSearchPage.checkBookingStatus('provisional')

    bookingSearchPage.clickOtherBookingStatusLink('active')
    bookingSearchPage.checkBookingStatus('active')

    bookingSearchPage.checkBookingDetailsAndClickView(this.premises, this.booking)
  })
})

Then('I should see a summary of the booking on the closed bookings page', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage)
    bookingSearchPage.checkBookingStatus('provisional')

    bookingSearchPage.clickOtherBookingStatusLink('closed')
    bookingSearchPage.checkBookingStatus('closed')

    bookingSearchPage.checkBookingDetailsAndClickView(this.premises, this.booking)
  })
})
