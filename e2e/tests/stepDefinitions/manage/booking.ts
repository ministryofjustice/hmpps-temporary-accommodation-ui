import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import BookingConfirmPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingConfirm'
import BookingHistoryPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingHistory'
import BookingNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingNew'
import BookingSelectAssessment from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingSelectAssessment'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import { bookingFactory, newBookingFactory, turnaroundFactory } from '../../../../server/testutils/factories'
import { person } from '../utils'

Given("I'm creating a booking", () => {
  cy.then(function _() {
    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, this.premises, this.room, null, this.room.name)
    bedspaceShowPage.clickBookBedspaceLink()

    const bookingNewPage = Page.verifyOnPage(BookingNewPage, this.premises, this.room, null)
    bookingNewPage.shouldShowBookingDetails()

    cy.wrap([]).as('historicBookings')
  })
})

Given('I create a booking with all necessary details', () => {
  cy.then(function _() {
    const bookingNewPage = Page.verifyOnPage(BookingNewPage, this.premises, this.room, null)
    bookingNewPage.assignTurnaroundDays('turnaroundDays')

    cy.then(function __() {
      const newBooking = newBookingFactory.build({
        crn: person.crn,
      })

      const booking = bookingFactory.provisional().build({
        ...newBooking,
        person,
        turnaround: turnaroundFactory.build({
          workingDays: this.turnaroundDays,
        }),
        effectiveEndDate: 'unknown',
        turnaroundStartDate: 'unknown',
      })
      booking.assessmentId = undefined

      bookingNewPage.completeForm(newBooking)

      BookingSelectAssessment.assignAssessmentSummaries('assessments')

      cy.get('@assessments').then(assessments => {
        const bookingSelectAssessmentPage = Page.verifyOnPage(BookingSelectAssessment, assessments)
        if (assessments.length) {
          bookingSelectAssessmentPage.selectNoAssessment()
        }
        bookingSelectAssessmentPage.clickSubmit()

        const bookingConfirmPage = Page.verifyOnPage(BookingConfirmPage, this.premises, this.room, null, person)
        bookingConfirmPage.shouldShowBookingDetails()

        bookingConfirmPage.clickSubmit()

        cy.wrap(booking).as('booking')
        this.historicBookings.push(booking)
      })
    })
  })
})

Given('I attempt to create a booking with required details missing', () => {
  cy.then(function _() {
    const bookingNewPage = Page.verifyOnPage(BookingNewPage, this.premises, this.room, null)
    bookingNewPage.enterCrn(person.crn)
    bookingNewPage.clickSubmit()
  })
})

Given('I attempt to create a conflicting booking', () => {
  cy.then(function _() {
    const bookingNewPage = Page.verifyOnPage(BookingNewPage, this.premises, this.room, null)

    const newBooking = newBookingFactory.build({
      ...this.booking,
    })

    bookingNewPage.completeForm(newBooking)

    BookingSelectAssessment.assignAssessmentSummaries('assessments')

    cy.get('@assessments').then(assessments => {
      const bookingSelectAssessmentPage = Page.verifyOnPage(BookingSelectAssessment, assessments)
      if (assessments.length) {
        bookingSelectAssessmentPage.selectNoAssessment()
      }
      bookingSelectAssessmentPage.clickSubmit()

      const bookingConfirmPage = Page.verifyOnPage(BookingConfirmPage, this.premises, this.room, null, person)
      bookingConfirmPage.shouldShowBookingDetails()

      bookingConfirmPage.clickSubmit()
    })
  })
})

Then('I should see a confirmation for my new booking', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, null, this.booking)
    bookingShowPage.shouldShowBanner('Booking created')
    bookingShowPage.shouldShowBookingDetails()

    bookingShowPage.clickBreadCrumbUp()

    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, this.premises, this.room, null, this.room.name)
    bedspaceShowPage.shouldShowBookingDetails(this.booking)
    bedspaceShowPage.clickBookingLink(this.booking)
  })
})

Then('I should see previous booking states in the booking history', () => {
  cy.then(function _() {
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, null, this.booking)
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
    const page = Page.verifyOnPage(BookingNewPage, this.premises, this.room, null)
    page.shouldShowErrorMessagesForFields(['arrivalDate', 'departureDate'])
  })
})

Then('I should see errors for the conflicting booking', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(BookingNewPage, this.premises, this.room, null)
    page.shouldShowDateConflictErrorMessages(this.booking, 'booking')
  })
})
