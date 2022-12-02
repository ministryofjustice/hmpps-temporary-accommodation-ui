import premisesFactory from '../../../../server/testutils/factories/premises'
import roomFactory from '../../../../server/testutils/factories/room'
import bookingFactory from '../../../../server/testutils/factories/booking'
import newArrivalFactory from '../../../../server/testutils/factories/newArrival'
import Page from '../../../../cypress_shared/pages/page'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import BookingArrivalNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingArrivalNew'
import arrivalFactory from '../../../../server/testutils/factories/arrival'

context('Booking arrival', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('navigates to the booking arrival page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and a confirmed booking in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const booking = bookingFactory.confirmed().build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })
    cy.task('stubBooking', { premisesId: premises.id, booking })

    // When I visit the show booking page
    const bookingShow = BookingShowPage.visit(premises, room, booking)

    // Add I click the marked arrived booking action
    bookingShow.clickMarkArrivedBookingButton()

    // Then I navigate to the booking confirmation page
    Page.verifyOnPage(BookingArrivalNewPage, premises.id, room.id, booking)
  })

  it('allows me to mark a booking as arrived', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and a confirmed booking in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const booking = bookingFactory.confirmed().build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })
    cy.task('stubBooking', { premisesId: premises.id, booking })

    // When I visit the booking confirmation page
    const page = BookingArrivalNewPage.visit(premises.id, room.id, booking)
    page.shouldShowBookingDetails()

    // And I fill out the form
    const arrival = arrivalFactory.build()
    const newArrival = newArrivalFactory.build({
      ...arrival,
    })

    cy.task('stubArrivalCreate', { premisesId: premises.id, bookingId: booking.id, arrival })

    page.completeForm(newArrival)

    // Then the confirmation should have been created in the API
    cy.task('verifyArrivalCreate', { premisesId: premises.id, bookingId: booking.id }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)
      expect(requestBody.arrivalDate).equal(newArrival.arrivalDate)
      expect(requestBody.expectedDepartureDate).equal(newArrival.expectedDepartureDate)
      expect(requestBody.notes).equal(newArrival.notes)
    })

    // And I should be redirected to the show booking page
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, premises, room, booking)
    bookingShowPage.shouldShowBanner('Booking marked as active')
  })

  it('shows errors when the API returns an error', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a confirmed booking in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const booking = bookingFactory.confirmed().build()

    cy.task('stubBooking', { premisesId: premises.id, booking })

    // When I visit the booking confirmation page
    const page = BookingArrivalNewPage.visit(premises.id, room.id, booking)

    // And I miss required fields
    cy.task('stubArrivalCreateErrors', {
      premisesId: premises.id,
      bookingId: booking.id,
      params: ['arrivalDate', 'expectedDepartureDate'],
    })
    page.clearForm()
    page.clickSubmit()

    // Then I should see error messages relating to those fields
    page.shouldShowErrorMessagesForFields(['arrivalDate', 'expectedDepartureDate'])
  })

  it('shows errors when the API returns a 409 conflict error', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a confirmed booking in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const booking = bookingFactory.confirmed().build()

    cy.task('stubBooking', { premisesId: premises.id, booking })

    // When I visit the booking confirmation page
    const page = BookingArrivalNewPage.visit(premises.id, room.id, booking)

    // And I fill out the form with dates that conflict with an existing booking
    const arrival = arrivalFactory.build()
    const newArrival = newArrivalFactory.build({
      ...arrival,
    })
    cy.task('stubArrivalCreateConflictError', { premisesId: premises.id, bookingId: booking.id })

    page.completeForm(newArrival)

    // Then I should see error messages for the date fields
    page.shouldShowDateConflictErrorMessages()
  })

  it('navigates back from the booking arrival page to the show booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and a confirmed booking in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const booking = bookingFactory.confirmed().build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })
    cy.task('stubBooking', { premisesId: premises.id, booking })

    // When I visit the booking arrival page
    const page = BookingArrivalNewPage.visit(premises.id, room.id, booking)

    // And I click the back link
    page.clickBack()

    // Then I navigate to the show bedspace page
    Page.verifyOnPage(BookingShowPage, booking)
  })
})
