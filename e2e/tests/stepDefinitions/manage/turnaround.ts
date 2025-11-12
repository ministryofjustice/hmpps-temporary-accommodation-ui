import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import BookingTurnaroundNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingTurnaroundNew'
import { cas3BookingFactory, cas3TurnaroundFactory, newTurnaroundFactory } from '../../../../server/testutils/factories'

Given("I edit the booking's turnaround time", () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.bedspace, this.booking)
    bookingShowPage.clickChangeTurnaround()

    const newTurnaround = newTurnaroundFactory.build()
    const turnaround = cas3TurnaroundFactory.build({
      ...newTurnaround,
    })

    const bookingTurnaroundNewPage = Page.verifyOnPage(
      BookingTurnaroundNewPage,
      this.premises,
      this.bedspace,
      this.booking,
    )
    bookingTurnaroundNewPage.shouldShowBookingDetails()
    bookingTurnaroundNewPage.completeForm(newTurnaround)

    const updatedBooking = cas3BookingFactory.build({
      ...this.booking,
      turnaround,
    })

    cy.wrap(updatedBooking).as('booking')
  })
})

Then('I should see the booking with the edited turnaround time', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.bedspace, this.booking)
    bookingShowPage.shouldShowBanner('Turnaround time changed')
    bookingShowPage.shouldShowBookingDetails()
  })
})
