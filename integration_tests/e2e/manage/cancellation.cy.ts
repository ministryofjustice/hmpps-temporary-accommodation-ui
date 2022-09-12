import premisesFactory from '../../../server/testutils/factories/premises'
import bookingFactory from '../../../server/testutils/factories/booking'
import cancellationFactory from '../../../server/testutils/factories/cancellation'

import CancellationCreatePage from '../../pages/cancellationCreate'
import CancellationConfirmPage from '../../pages/cancellationConfirmation'

context('Cancellation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubCancellationReferenceData')
  })

  it('should allow me to create a cancellation', () => {
    // Given I am signed in
    cy.signIn()

    // And a booking is available
    const premises = premisesFactory.build()
    const booking = bookingFactory.build()
    cy.task('stubBookingGet', { premisesId: premises.id, booking })

    // When I navigate to the booking's cancellation page
    const cancellation = cancellationFactory.build({ date: new Date(Date.UTC(2022, 5, 1, 0, 0, 0)).toISOString() })
    cy.task('stubCancellationCreate', { premisesId: premises.id, bookingId: booking.id, cancellation })
    cy.task('stubCancellationGet', { premisesId: premises.id, bookingId: booking.id, cancellation })

    const page = CancellationCreatePage.visit(premises.id, booking.id)

    // And I fill out the cancellation form
    page.completeForm(cancellation)

    // Then a cancellation should have been created in the API
    cy.task('verifyCancellationCreate', {
      premisesId: premises.id,
      bookingId: booking.id,
      cancellation,
    }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.date).equal(cancellation.date)
      expect(requestBody.notes).equal(cancellation.notes)
      expect(requestBody.reason).equal(cancellation.reason.id)
    })

    // And I should see a confirmation screen for that cancellation
    const cancellationConfirmationPage = new CancellationConfirmPage()
    cancellationConfirmationPage.verifyConfirmedCancellationIsVisible(cancellation, booking)
  })

  it('should show errors', () => {
    // Given I am signed in
    cy.signIn()

    // And a booking is available
    const premises = premisesFactory.build()
    const booking = bookingFactory.build()
    cy.task('stubBookingGet', { premisesId: premises.id, booking })

    // When I navigate to the booking's cancellation page
    const cancellation = cancellationFactory.build({ date: new Date(Date.UTC(2022, 5, 1, 0, 0, 0)).toISOString() })
    cy.task('stubCancellationCreate', { premisesId: premises.id, bookingId: booking.id, cancellation })
    cy.task('stubCancellationGet', { premisesId: premises.id, bookingId: booking.id, cancellation })

    const page = CancellationCreatePage.visit(premises.id, booking.id)

    // And I miss a required field
    cy.task('stubCancellationErrors', {
      premisesId: premises.id,
      bookingId: booking.id,
      params: ['date', 'reason'],
    })

    page.clickSubmit()

    // Then I should see error messages relating to that field
    page.shouldShowErrorMessagesForFields(['date', 'reason'])
  })
})
