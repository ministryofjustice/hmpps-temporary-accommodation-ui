import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import BookingHistoryPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingHistory'

Given('I view the booking history', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.clickHistoryLink()
  })
})

Then('I should see previous booking states', () => {
  cy.then(function _() {
    const bookingHistoryPage = Page.verifyOnPage(
      BookingHistoryPage,
      this.premises,
      this.room,
      this.booking,
      this.historicBookings,
    )
    bookingHistoryPage.shouldShowBookingHistory()
  })
})
