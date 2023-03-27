import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import BookingCancellationEditPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingCancellationEdit'
import BookingCancellationNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingCancellationNew'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
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

    const bookingCancellationPage = Page.verifyOnPage(
      BookingCancellationNewPage,
      this.premises,
      this.room,
      this.booking,
    )
    bookingCancellationPage.shouldShowBookingDetails()
    bookingCancellationPage.completeForm(newCancellation)

    const cancelledBooking = bookingFactory.build({
      ...this.booking,
      status: 'cancelled',
      cancellation,
    })

    cy.wrap(cancelledBooking).as('booking')
    this.historicBookings.push(cancelledBooking)
  })
})

Given('I attempt to cancel the booking with required details missing', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.clickCancelBookingButton()

    const bookingCancellationPage = Page.verifyOnPage(
      BookingCancellationNewPage,
      this.premises,
      this.room,
      this.booking,
    )
    bookingCancellationPage.clickSubmit()
  })
})

Given('I edit the cancelled booking', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.clickEditCancelledBookingButton()

    const cancellation = cancellationFactory.build()
    const newCancellation = newCancellationFactory.build({
      ...cancellation,
      reason: cancellation.reason.id,
    })

    const bookingCancellationPage = Page.verifyOnPage(
      BookingCancellationEditPage,
      this.premises,
      this.room,
      this.booking,
    )
    bookingCancellationPage.shouldShowBookingDetails()
    bookingCancellationPage.completeForm(newCancellation)

    const cancelledBooking = bookingFactory.build({
      ...this.booking,
      status: 'cancelled',
      cancellation,
    })

    cy.wrap(cancelledBooking).as('booking')
    this.historicBookings.push(cancelledBooking)
  })
})

Given('I attempt to edit the cancelled booking with required details missing', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.clickEditCancelledBookingButton()

    const bookingCancellationPage = Page.verifyOnPage(
      BookingCancellationEditPage,
      this.premises,
      this.room,
      this.booking,
    )
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

    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, this.premises, this.room)
    bedspaceShowPage.shouldShowBookingDetails(this.booking)
    bedspaceShowPage.clickBookingLink(this.booking)
  })
})

Then('I should see the booking with the edited cancellation details', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.shouldShowBanner('Cancelled booking updated')
    bookingShowPage.shouldShowBookingDetails()

    bookingShowPage.clickBreadCrumbUp()

    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, this.premises, this.room)
    bedspaceShowPage.shouldShowBookingDetails(this.booking)
    bedspaceShowPage.clickBookingLink(this.booking)
  })
})

Then('I should see a list of the problems encountered cancelling the booking', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(BookingCancellationNewPage, this.premises, this.room, this.booking)
    page.shouldShowErrorMessagesForFields(['date'], 'bookingCancellation')

    page.clickBack()
  })
})

Then('I should see a list of the problems encountered editing the cancelling booking', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(BookingCancellationEditPage, this.premises, this.room, this.booking)
    page.shouldShowErrorMessagesForFields(['date'], 'bookingCancellation')

    page.clickBack()
  })
})
