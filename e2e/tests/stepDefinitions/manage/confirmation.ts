import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import BookingConfirmationNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingConfirmationNew'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import bookingFactory from '../../../../server/testutils/factories/booking'
import confirmationFactory from '../../../../server/testutils/factories/confirmation'
import newConfirmationFactory from '../../../../server/testutils/factories/newConfirmation'

Given('I confirm the booking', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.clickConfirmBookingButton()

    const newConfirmation = newConfirmationFactory.build()
    const confirmation = confirmationFactory.build({
      ...newConfirmation,
    })

    const bookingConfirmationPage = Page.verifyOnPage(
      BookingConfirmationNewPage,
      this.premises,
      this.room,
      this.booking,
    )
    bookingConfirmationPage.shouldShowBookingDetails()
    bookingConfirmationPage.completeForm(newConfirmation)

    const confirmedBooking = bookingFactory.build({
      ...this.booking,
      status: 'confirmed',
      confirmation,
    })

    cy.wrap(confirmedBooking).as('booking')
    this.historicBookings.push(confirmedBooking)
  })
})

Then('I should see the booking with the confirmed status', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.shouldShowBanner('Booking confirmed')
    bookingShowPage.shouldShowBookingDetails()

    bookingShowPage.clickBreadCrumbUp()

    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, this.premises, this.room)
    bedspaceShowPage.shouldShowBookingDetails(this.booking)
  })
})
