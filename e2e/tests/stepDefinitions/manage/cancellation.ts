import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import BookingCancellationNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingCancellationNew'
import bookingFactory from '../../../../server/testutils/factories/booking'
import cancellationFactory from '../../../../server/testutils/factories/cancellation'
import newCancellationFactory from '../../../../server/testutils/factories/newCancellation'

Given('I cancel the booking', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.clickCancelBookingButton()

    const cancellation = cancellationFactory.build()
    const newCancellation = newCancellationFactory.build({
      ...cancellation,
      reason: cancellation.reason.id,
    })

    const bookingCancellationPage = Page.verifyOnPage(BookingCancellationNewPage, this.booking)
    bookingCancellationPage.shouldShowBookingDetails()
    bookingCancellationPage.completeForm(newCancellation)

    const cancelledBooking = bookingFactory.build({
      ...this.booking,
      status: 'cancelled',
      cancellation,
    })

    cy.wrap(cancelledBooking).as('booking')
  })
})

Given('I attempt to cancel the booking with required details missing', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.clickCancelBookingButton()

    const bookingCancellationPage = Page.verifyOnPage(BookingCancellationNewPage, this.booking)
    bookingCancellationPage.clearForm()
    bookingCancellationPage.clickSubmit()
  })
})

Then('I should see the booking with the cancelled status', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.shouldShowBanner('Booking cancelled')
    bookingShowPage.shouldShowBookingDetails()

    bookingShowPage.clickBreadCrumbUp()

    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, this.room)
    bedspaceShowPage.shouldShowBookingDetails(this.booking)
  })
})

Then('I should see a list of the problems encountered marking the booking as departed', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(BookingCancellationNewPage, this.booking)

    page.shouldShowErrorMessagesForFields(['date'])
  })
})
