import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import BookingArrivalNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingArrivalNew'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import arrivalFactory from '../../../../server/testutils/factories/arrival'
import bookingFactory from '../../../../server/testutils/factories/booking'
import newArrivalFactory from '../../../../server/testutils/factories/newArrival'

Given('I mark the booking as arrived', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.clickMarkArrivedBookingButton()

    const newArrival = newArrivalFactory.build()
    const arrival = arrivalFactory.build({
      ...newArrival,
    })

    const bookingArrivalPage = Page.verifyOnPage(BookingArrivalNewPage, this.booking)
    bookingArrivalPage.shouldShowBookingDetails()
    bookingArrivalPage.completeForm(newArrival)

    const arrivedBooking = bookingFactory.build({
      ...this.booking,
      status: 'arrived',
      arrivalDate: newArrival.arrivalDate,
      departureDate: newArrival.expectedDepartureDate,
      arrival,
    })

    cy.wrap(arrivedBooking).as('booking')
    this.historicBookings.push(arrivedBooking)
  })
})

Given('I attempt to mark the booking as arrived with required details missing', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.clickMarkArrivedBookingButton()

    const bookingArrivalPage = Page.verifyOnPage(BookingArrivalNewPage, this.booking)
    bookingArrivalPage.clearForm()
    bookingArrivalPage.clickSubmit()
  })
})

Then('I should see the booking with the arrived status', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.shouldShowBanner('Booking marked as active')
    bookingShowPage.shouldShowBookingDetails()

    bookingShowPage.clickBreadCrumbUp()

    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, this.premises, this.room)
    bedspaceShowPage.shouldShowBookingDetails(this.booking)
  })
})

Then('I should see a list of the problems encountered marking the booking as arrived', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(BookingArrivalNewPage, this.booking)

    page.shouldShowErrorMessagesForFields(['arrivalDate', 'expectedDepartureDate'])
  })
})
