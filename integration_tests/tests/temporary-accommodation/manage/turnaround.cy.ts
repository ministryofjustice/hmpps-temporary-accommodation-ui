import Page from '../../../../cypress_shared/pages/page'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import BookingTurnaroundNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingTurnaroundNew'
import { setupBookingStateStubs } from '../../../../cypress_shared/utils/booking'
import setupTestUser from '../../../../cypress_shared/utils/setupTestUser'
import {
  bookingFactory,
  lostBedFactory,
  newTurnaroundFactory,
  turnaroundFactory,
} from '../../../../server/testutils/factories'

context('Booking turnarounds', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser()
  })

  it('navigates to the change turnaround page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and a booking in the database
    const booking = bookingFactory.provisional().build()
    const { premises, room } = setupBookingStateStubs(booking)

    // When I visit the show booking page
    const bookingShow = BookingShowPage.visit(premises, room, booking)

    // Add I click the extend booking action
    bookingShow.clickChangeTurnaround()

    // Then I navigate to the change turnaround page
    Page.verifyOnPage(BookingTurnaroundNewPage, premises, room, booking)
  })

  it('allows me to change a turnaround', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and a booking in the database
    const booking = bookingFactory.arrived().build()
    const { premises, room } = setupBookingStateStubs(booking)

    // When I visit the change turnaround page
    const page = BookingTurnaroundNewPage.visit(premises, room, booking)
    page.shouldShowBookingDetails()

    // And I fill out the form
    const turnaround = turnaroundFactory.build()
    const newTurnaround = newTurnaroundFactory.build({
      ...turnaround,
    })

    cy.task('stubTurnaroundCreate', { premisesId: premises.id, bookingId: booking.id, turnaround })

    page.completeForm(newTurnaround)

    // Then the turnaround should have been created in the API
    cy.task('verifyTurnaroundCreate', { premisesId: premises.id, bookingId: booking.id }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)
      expect(requestBody.workingDays).equal(newTurnaround.workingDays)
    })

    // And I should be redirected to the show booking page
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, premises, room, booking)
    bookingShowPage.shouldShowBanner('Turnaround time changed')
  })

  it('shows errors when the API returns an error', () => {
    // Given I am signed in
    cy.signIn()

    // And there is an arrived booking in the database
    const booking = bookingFactory.arrived().build()
    const { premises, room } = setupBookingStateStubs(booking)

    // When I visit the change turnaround page
    const page = BookingTurnaroundNewPage.visit(premises, room, booking)

    // And I miss required fields
    cy.task('stubTurnaroundCreateErrors', {
      premisesId: premises.id,
      bookingId: booking.id,
      params: ['workingDays'],
    })
    page.clearForm()
    page.clickSubmit()

    // Then I should see error messages relating to those fields
    page.shouldShowErrorMessagesForFields(['workingDays'])
  })

  it('shows errors when the API returns a 409 conflict error', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a booking and a conflicting lost bed in the database
    const booking = bookingFactory.departed().build()
    const conflictingLostBed = lostBedFactory.build()

    const { premises, room } = setupBookingStateStubs(booking)
    cy.task('stubSingleLostBed', { premisesId: premises.id, lostBed: conflictingLostBed })

    // When I visit the change turnaround page
    const page = BookingTurnaroundNewPage.visit(premises, room, booking)

    // And I fill out the form with days that conflict with an existing booking
    const turnaround = turnaroundFactory.build()
    const newTurnaround = newTurnaroundFactory.build({
      ...turnaround,
    })
    cy.task('stubTurnaroundCreateConflictError', {
      premisesId: premises.id,
      bookingId: booking.id,
      conflictingEntityId: conflictingLostBed.id,
      conflictingEntityType: 'lost-bed',
    })

    page.completeForm(newTurnaround)

    // Then I should see error messages for the conflict
    page.shouldShowDateConflictErrorMessages(conflictingLostBed, 'lost-bed')
  })

  it('navigates back from the change turnaround page to the show booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and a booking in the database
    const booking = bookingFactory.arrived().build()
    const { premises, room } = setupBookingStateStubs(booking)

    // When I visit the change turnaround page
    const page = BookingTurnaroundNewPage.visit(premises, room, booking)

    // And I click the back link
    page.clickBack()

    // Then I navigate to the show bedspace page
    Page.verifyOnPage(BookingShowPage, premises, room, booking)
  })
})
