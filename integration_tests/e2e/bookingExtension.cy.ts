import premisesFactory from '../../server/testutils/factories/premises'
import bookingFactory from '../../server/testutils/factories/booking'

import BookingExtensionsConfirmation from '../pages/booking/extension/confirmation'
import BookingExtensionCreatePage from '../pages/booking/extension/create'

context('BookingExtension', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('should show booking extension form', () => {
    const booking = bookingFactory.build({
      expectedDepartureDate: new Date(Date.UTC(2022, 5, 3, 0, 0, 0)).toISOString(),
    })
    const newDepartureDate = new Date(Date.UTC(2022, 6, 3, 0, 0, 0)).toISOString()
    const premises = premisesFactory.build()

    cy.task('stubBookingExtensionCreate', { premisesId: premises.id, booking })
    cy.task('stubBookingGet', { premisesId: premises.id, booking })
    cy.task('stubSinglePremises', { premisesId: premises.id, booking })

    // Given I am signed in
    cy.signIn()

    // When I visit the booking extension page
    const page = BookingExtensionCreatePage.visit(premises.id, booking.id)

    // And I fill in the extension form
    page.completeForm(newDepartureDate)
    page.clickSubmit()

    // Then I should be redirected to the confirmation page
    const bookingConfirmationPage = new BookingExtensionsConfirmation()
    bookingConfirmationPage.verifyBookingIsVisible(booking)

    // And the extension should be created in the API
    cy.task('verifyBookingExtensionCreate', { premisesId: premises.id, bookingId: booking.id }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.newDepartureDate).equal(newDepartureDate)
    })
  })

  it('should show errors', () => {
    const premises = premisesFactory.build()
    const booking = bookingFactory.build({
      expectedDepartureDate: new Date(Date.UTC(2022, 5, 3, 0, 0, 0)).toISOString(),
    })

    cy.task('stubSinglePremises', { premisesId: premises.id })
    cy.task('stubBookingGet', { premisesId: premises.id, booking })

    // Given I am signed in
    cy.signIn()

    // When I visit the booking extension page
    const page = BookingExtensionCreatePage.visit(premises.id, booking.id)

    // And I don't enter details into the field
    cy.task('stubBookingExtensionErrors', {
      premisesId: premises.id,
      bookingId: booking.id,
      params: ['newDepartureDate'],
    })
    page.clickSubmit()

    // Then I should see error messages relating to the field
    page.shouldShowErrorMessagesForFields(['newDepartureDate'])
  })
})
