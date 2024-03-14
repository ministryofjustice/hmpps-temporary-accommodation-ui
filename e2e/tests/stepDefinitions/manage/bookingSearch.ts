import { Then, When } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import BookingSearchPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingSearch'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'

When(`I'm searching bookings`, () => {
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

Then('I should see a summary of the booking on the departed bookings page', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage)
    bookingSearchPage.checkBookingStatus('provisional')

    bookingSearchPage.clickOtherBookingStatusLink('departed')
    bookingSearchPage.checkBookingStatus('departed')

    bookingSearchPage.checkBookingDetailsAndClickView(this.premises, this.booking)
  })
})

When('I search for a CRN that does not exist in provisional bookings', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage, 'provisional')
    bookingSearchPage.searchByCRN('N000000', 'provisional')
  })
})

Then('I should see a message that the provisional booking is not found', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage, 'provisional')
    bookingSearchPage.checkNoResultsByCRN('provisional', 'N000000')
  })
})

When('I click on the Departed bookings tab', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage)
    bookingSearchPage.clickOtherBookingStatusLink('departed')
  })
})

Then('I should see a message that the departed booking is not found', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage, 'departed')
    bookingSearchPage.checkNoResultsByCRN('departed', 'N000000')
  })
})

When('I click on the Provisional bookings tab', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage, 'departed')
    bookingSearchPage.clickOtherBookingStatusLink('provisional')
  })
})

When('I search for a valid CRN in provisional bookings', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage, 'provisional')
    bookingSearchPage.searchByCRN(this.booking.person.crn, 'provisional')
  })
})

Then('I see the provisional booking I was searching for', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage, 'provisional')
    bookingSearchPage.checkBookingDetailsAndClickView(this.premises, this.booking)
  })
})
