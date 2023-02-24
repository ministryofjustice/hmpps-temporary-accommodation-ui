import Page from '../../../../cypress_shared/pages/page'
import BookingConfirmationNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingConfirmationNew'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import setupTestUser from '../../../../cypress_shared/utils/setupTestUser'
import bookingFactory from '../../../../server/testutils/factories/booking'
import confirmationFactory from '../../../../server/testutils/factories/confirmation'
import newConfirmationFactory from '../../../../server/testutils/factories/newConfirmation'
import premisesFactory from '../../../../server/testutils/factories/premises'
import roomFactory from '../../../../server/testutils/factories/room'

context('Booking confirmation', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser()
  })

  it('navigates to the confirm booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and a provisional booking in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const booking = bookingFactory.provisional().build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })
    cy.task('stubBooking', { premisesId: premises.id, booking })

    // When I visit the show booking page
    const bookingShow = BookingShowPage.visit(premises, room, booking)

    // Add I click the confim booking action
    bookingShow.clickConfirmBookingButton()

    // Then I navigate to the booking confirmation page
    Page.verifyOnPage(BookingConfirmationNewPage, premises, room, booking)
  })

  it('allows me to confirm a booking', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and a provisional booking in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const booking = bookingFactory.provisional().build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })
    cy.task('stubBooking', { premisesId: premises.id, booking })

    // When I visit the booking confirmation page
    const page = BookingConfirmationNewPage.visit(premises, room, booking)
    page.shouldShowBookingDetails()

    // And I fill out the form
    const confirmation = confirmationFactory.build()
    const newConfirmation = newConfirmationFactory.build({
      ...confirmation,
    })

    cy.task('stubConfirmationCreate', { premisesId: premises.id, bookingId: booking.id, confirmation })

    page.completeForm(newConfirmation)

    // Then the confirmation should have been created in the API
    cy.task('verifyConfirmationCreate', { premisesId: premises.id, bookingId: booking.id }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.notes).equal(newConfirmation.notes)
    })

    // And I should be redirected to the show booking page
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, premises, room, booking)
    bookingShowPage.shouldShowBanner('Booking confirmed')
  })

  it('navigates back from the booking confirmation page to the show booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and a provisional booking in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const booking = bookingFactory.provisional().build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })
    cy.task('stubBooking', { premisesId: premises.id, booking })

    // When I visit the booking confirmation page
    const page = BookingConfirmationNewPage.visit(premises, room, booking)

    // And I click the back link
    page.clickBack()

    // Then I navigate to the show bedspace page
    Page.verifyOnPage(BookingShowPage, premises, room, booking)
  })
})
