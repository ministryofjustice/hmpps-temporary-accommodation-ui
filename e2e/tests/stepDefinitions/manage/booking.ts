import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import BookingConfirmPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingConfirm'
import BookingNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingNew'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import bookingFactory from '../../../../server/testutils/factories/booking'
import newBookingFactory from '../../../../server/testutils/factories/newBooking'
import personFactory from '../../../../server/testutils/factories/person'
import { throwMissingCypressEnvError } from '../utils'

const offenderCrn = Cypress.env('offender_crn') || throwMissingCypressEnvError('offender_crn')

Given("I'm creating a booking", () => {
  cy.then(function _() {
    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, this.premise, this.room)
    bedspaceShowPage.clickBookBedspaceLink()

    const bookingNewPage = Page.verifyOnPage(BookingNewPage, this.premises, this.room)
    bookingNewPage.shouldShowBookingDetails()

    cy.wrap([]).as('historicBookings')
  })
})

Given('I create a booking with all necessary details', () => {
  cy.then(function _() {
    const bookingNewPage = Page.verifyOnPage(BookingNewPage, this.premises, this.room)

    const newBooking = newBookingFactory.build({
      crn: offenderCrn,
    })

    const booking = bookingFactory.provisional().build({
      ...newBooking,
      person: personFactory.build({
        crn: newBooking.crn,
      }),
    })

    bookingNewPage.completeForm(newBooking)

    const bookingConfirmPage = Page.verifyOnPage(BookingConfirmPage, this.premises, this.room, booking)
    bookingConfirmPage.shouldShowBookingDetails()

    bookingConfirmPage.clickSubmit()

    cy.wrap(booking).as('booking')
    this.historicBookings.push(booking)
  })
})

Given('I attempt to create a booking with required details missing', () => {
  cy.then(function _() {
    const bookingNewPage = Page.verifyOnPage(BookingNewPage, this.premises, this.room)
    bookingNewPage.clickSubmit()

    const bookingConfirmPage = Page.verifyOnPage(BookingConfirmPage, this.premises, this.room)
    bookingConfirmPage.shouldShowBookingDetails()

    bookingConfirmPage.clickSubmit()
  })
})

Then('I should see a confirmation for my new booking', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.shouldShowBanner('Booking created')
    bookingShowPage.shouldShowBookingDetails()

    bookingShowPage.clickBreadCrumbUp()

    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, this.premises, this.room)
    bedspaceShowPage.shouldShowBookingDetails(this.booking)
  })
})

Then('I should see a list of the problems encountered creating the booking', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(BookingNewPage, this.premises, this.room)
    page.shouldShowErrorMessagesForFields(['crn', 'arrivalDate', 'departureDate'])
  })
})
