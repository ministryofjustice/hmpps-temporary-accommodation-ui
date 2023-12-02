import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import BookingArrivalNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingArrivalNew'
import BookingArrivalEditPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingArrivalEdit'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import { arrivalFactory, bookingFactory, newArrivalFactory } from '../../../../server/testutils/factories'

Given('I mark the booking as arrived', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.clickMarkArrivedBookingButton()

    const newArrival = newArrivalFactory.build()
    const arrival = arrivalFactory.build({
      ...newArrival,
    })

    const bookingArrivalPage = Page.verifyOnPage(BookingArrivalNewPage, this.premises, this.room, this.booking)
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

    const bookingArrivalPage = Page.verifyOnPage(BookingArrivalNewPage, this.premises, this.room, this.booking)
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
    bedspaceShowPage.clickBookingLink(this.booking)
  })
})

Then('I should see a list of the problems encountered marking the booking as arrived', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(BookingArrivalNewPage, this.premises, this.room, this.booking)
    page.shouldShowErrorMessagesForFields(['arrivalDate', 'expectedDepartureDate'])

    page.clickBack()
  })
})

When('I navigate to change the booking arrival', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.clickEditArrivalButton()
  })
})

When('I enter the change arrival data incorrectly', () => {
  cy.then(function _() {
    const bookingArrivalPage = Page.verifyOnPage(BookingArrivalEditPage, this.premises, this.room, this.booking)
    bookingArrivalPage.shouldShowBookingDetails()
    bookingArrivalPage.clearForm()
    bookingArrivalPage.clickSubmit()
  })
})

Then('I should see a list of the problems encountered whilst changing the booking arrival', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(BookingArrivalEditPage, this.premises, this.room, this.booking)
    page.shouldShowErrorMessagesForFields(['arrivalDate'])
  })
})

When('I enter change booking data correctly', () => {
  cy.then(function _() {
    const newArrival = newArrivalFactory.build()

    const bookingArrivalPage = Page.verifyOnPage(BookingArrivalEditPage, this.premises, this.room, this.booking)
    bookingArrivalPage.shouldShowBookingDetails()
    bookingArrivalPage.completeForm(newArrival)

    cy.then(() => {
      this.booking.arrivalDate = newArrival.arrivalDate
      this.booking.arrival.notes = newArrival.notes
      cy.wrap(this.booking).as('booking')
    })
  })
})

Then('I should see the booking with confirmation of arrival change', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.shouldShowBanner('Arrival updated')
    bookingShowPage.shouldShowBookingDetails()
    bookingShowPage.clickBreadCrumbUp()
  })
})
