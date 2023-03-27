import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import BookingConfirmPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingConfirm'
import BookingHistoryPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingHistory'
import BookingNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingNew'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import bookingFactory from '../../../../server/testutils/factories/booking'
import newBookingFactory from '../../../../server/testutils/factories/newBooking'
import personFactory from '../../../../server/testutils/factories/person'
import { throwMissingCypressEnvError } from '../utils'
import devPersonData from '../../../../cypress_shared/fixtures/person-dev.json'
import localPersonData from '../../../../cypress_shared/fixtures/person-local.json'

const environment = Cypress.env('environment') || throwMissingCypressEnvError('environment')

const person = personFactory.build(environment === 'local' ? localPersonData : devPersonData)

Given("I'm creating a booking", () => {
  cy.then(function _() {
    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, this.premises, this.room)
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
      crn: person.crn,
    })

    const booking = bookingFactory.provisional().build({
      ...newBooking,
      person,
    })

    bookingNewPage.completeForm(newBooking)

    const bookingConfirmPage = Page.verifyOnPage(BookingConfirmPage, this.premises, this.room, person)
    bookingConfirmPage.shouldShowBookingDetails()

    bookingConfirmPage.clickSubmit()

    cy.wrap(booking).as('booking')
    this.historicBookings.push(booking)
  })
})

Given('I attempt to create a booking with required details missing', () => {
  cy.then(function _() {
    const bookingNewPage = Page.verifyOnPage(BookingNewPage, this.premises, this.room)
    bookingNewPage.enterCrn(person.crn)
    bookingNewPage.clickSubmit()

    const bookingConfirmPage = Page.verifyOnPage(BookingConfirmPage, this.premises, this.room, person)
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
    bedspaceShowPage.clickBookingLink(this.booking)
  })
})

Then('I should see previous booking states in the booking history', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)
    bookingShowPage.clickHistoryLink()

    const bookingHistoryPage = Page.verifyOnPage(
      BookingHistoryPage,
      this.premises,
      this.room,
      this.booking,
      this.historicBookings,
    )
    bookingHistoryPage.shouldShowBookingHistory()

    bookingHistoryPage.clickBack()
  })
})

Then('I should see a list of the problems encountered creating the booking', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(BookingNewPage, this.premises, this.room)
    page.shouldShowErrorMessagesForFields(['arrivalDate', 'departureDate'])
  })
})
