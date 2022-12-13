import premisesFactory from '../../../../server/testutils/factories/premises'
import roomFactory from '../../../../server/testutils/factories/room'
import bookingFactory from '../../../../server/testutils/factories/booking'
import Page from '../../../../cypress_shared/pages/page'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import BookingCancellationNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingCancellationNew'
import cancellationFactory from '../../../../server/testutils/factories/cancellation'
import newCancellationFactory from '../../../../server/testutils/factories/newCancellation'

context('Booking cancellation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('allows me to mark a booking as cancelled', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and a provisional booking in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const booking = bookingFactory.provisional().build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })
    cy.task('stubBooking', { premisesId: premises.id, booking })

    // When I visit the booking cancellation page
    cy.task('stubCancellationReferenceData')
    const page = BookingCancellationNewPage.visit(premises.id, room.id, booking)
    page.shouldShowBookingDetails()

    // And I fill out the form
    const cancellation = cancellationFactory.build()
    const newCancellation = newCancellationFactory.build({
      ...cancellation,
      reason: cancellation.reason.id,
    })

    cy.task('stubCancellationCreate', { premisesId: premises.id, bookingId: booking.id, cancellation })

    page.completeForm(newCancellation)

    // Then the cancellation should have been created in the API
    cy.task('verifyCancellationCreate', { premisesId: premises.id, bookingId: booking.id }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)
      expect(requestBody.date).equal(newCancellation.date)
      expect(requestBody.reason).equal(newCancellation.reason)
      expect(requestBody.notes).equal(newCancellation.notes)
    })

    // And I should be redirected to the show booking page
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, premises, room, booking)
    bookingShowPage.shouldShowBanner('Booking cancelled')
  })

  it('shows errors when the API returns an error', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a provisional booking in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const booking = bookingFactory.provisional().build()

    cy.task('stubBooking', { premisesId: premises.id, booking })

    // When I visit the booking cancellation page
    cy.task('stubCancellationReferenceData')
    const page = BookingCancellationNewPage.visit(premises.id, room.id, booking)

    // And I miss required fields
    cy.task('stubCancellationCreateErrors', {
      premisesId: premises.id,
      bookingId: booking.id,
      params: ['date'],
    })
    page.clearForm()
    page.clickSubmit()

    // Then I should see error messages relating to those fields
    page.shouldShowErrorMessagesForFields(['date'], 'bookingCancellation')
  })

  it('navigates back from the booking cancellation page to the show booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and a provisional booking in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const booking = bookingFactory.provisional().build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })
    cy.task('stubBooking', { premisesId: premises.id, booking })

    // When I visit the booking cancellation page
    cy.task('stubCancellationReferenceData')
    const page = BookingCancellationNewPage.visit(premises.id, room.id, booking)

    // And I click the back link
    page.clickBack()

    // Then I navigate to the show bedspace page
    Page.verifyOnPage(BookingShowPage, booking)
  })
})
