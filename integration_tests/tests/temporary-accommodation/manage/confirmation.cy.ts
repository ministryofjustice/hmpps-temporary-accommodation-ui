import Page from '../../../../cypress_shared/pages/page'
import BookingConfirmationNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingConfirmationNew'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import { setupBookingStateStubs } from '../../../../cypress_shared/utils/booking'
import { setupTestUser } from '../../../../cypress_shared/utils/setupTestUser'
import { bookingFactory, confirmationFactory, newConfirmationFactory } from '../../../../server/testutils/factories'

context('Booking confirmation', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser('assessor')
  })

  it('navigates to the confirm booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and a provisional booking in the database
    const booking = bookingFactory.provisional().build()
    const { premises, bedspace } = setupBookingStateStubs(booking)

    // When I visit the show booking page
    const bookingShow = BookingShowPage.visit(premises, null, bedspace, booking)

    // Add I click the confim booking action
    bookingShow.clickConfirmBookingButton()

    // Then I navigate to the booking confirmation page
    Page.verifyOnPage(BookingConfirmationNewPage, premises, null, bedspace, booking)
  })

  it('allows me to confirm a booking', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and a provisional booking in the database
    const booking = bookingFactory.provisional().build()
    const { premises, bedspace } = setupBookingStateStubs(booking)

    // When I visit the booking confirmation page
    const page = BookingConfirmationNewPage.visit(premises, null, bedspace, booking)
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
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, premises, null, bedspace, booking)
    bookingShowPage.shouldShowBanner('Booking confirmed')
  })

  it('navigates back from the booking confirmation page to the show booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and a provisional booking in the database
    const booking = bookingFactory.provisional().build()
    const { premises, bedspace } = setupBookingStateStubs(booking)

    // When I visit the booking confirmation page
    const page = BookingConfirmationNewPage.visit(premises, null, bedspace, booking)

    // And I click the back link
    page.clickBack()

    // Then I navigate to the show bedspace page
    Page.verifyOnPage(BookingShowPage, premises, null, bedspace, booking)
  })
})
