import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import BookingTurnaroundEditPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingTurnaroundEdit'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import { bookingFactory, turnaroundFactory, updateTurnaroundFactory } from '../../../../server/testutils/factories'

Given("I edit the booking's turnaround time", () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.clickMarkArrivedBookingButton()

    const updateTurnaround = updateTurnaroundFactory.build()
    const turnaround = turnaroundFactory.build({
      ...updateTurnaround,
    })

    const bookingTurnaroundEditPage = Page.verifyOnPage(
      BookingTurnaroundEditPage,
      this.premises,
      this.room,
      this.booking,
    )
    bookingTurnaroundEditPage.shouldShowBookingDetails()
    bookingTurnaroundEditPage.completeForm(updateTurnaround)

    const updatedBooking = bookingFactory.build({
      ...this.booking,
      turnaround,
    })

    cy.wrap(updatedBooking).as('booking')
  })
})

Then('I should see the booking with the edited turnaround time', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.shouldShowBanner('Turnaround time changed')
    bookingShowPage.shouldShowBookingDetails()
  })
})
