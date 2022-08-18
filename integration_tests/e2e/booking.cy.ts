import premisesFactory from '../../server/testutils/factories/premises'
import bookingFactory from '../../server/testutils/factories/booking'
import BookingCreatePage from '../pages/bookingCreate'
import BookingShowPage from '../pages/bookingShow'
import Page from '../pages/page'
import BookingConfirmation from '../pages/bookingConfirmation'

context('Booking', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('should show booking form', () => {
    const booking = bookingFactory.build({
      crn: '1bee477b-462f-47c1-8f71-7835a76a2c42',
      expectedArrivalDate: new Date(Date.UTC(2022, 5, 1, 0, 0, 0)).toISOString(),
      expectedDepartureDate: new Date(Date.UTC(2022, 5, 3, 0, 0, 0)).toISOString(),
      keyWorker: 'Alex Evans',
    })

    const premises = premisesFactory.build()
    cy.task('stubBookingCreate', { premisesId: premises.id, booking })
    cy.task('stubBookingGet', { premisesId: premises.id, booking })
    cy.task('stubSinglePremises', { premisesId: premises.id, booking })

    // Given I am signed in
    cy.signIn()

    // When I visit the booking page
    const page = BookingCreatePage.visit(premises.id)

    // And I fill in the booking form
    page.completeForm(booking)
    page.clickSubmit()

    // Then I should be redirected to the confirmation page and the booking should be created in the API
    Page.verifyOnPage(BookingConfirmation)
    const bookingConfirmationPage = new BookingConfirmation()
    bookingConfirmationPage.verifyBookingIsVisible(booking)

    cy.task('verifyBookingCreate', { premisesId: premises.id }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.crn).equal('1bee477b-462f-47c1-8f71-7835a76a2c42')
      expect(requestBody.expectedArrivalDate).equal(booking.expectedArrivalDate)
      expect(requestBody.expectedDepartureDate).equal(booking.expectedDepartureDate)
      expect(requestBody.keyWorker).equal('55126a32-0d27-4044-bc4e-e21c01632e56')
    })
  })

  it('should show errors', () => {
    const premises = premisesFactory.build()
    cy.task('stubSinglePremises', { premisesId: premises.id })

    // Given I am signed in
    cy.signIn()

    // When I visit the booking page
    const page = BookingCreatePage.visit(premises.id)

    // And I miss a required field
    cy.task('stubBookingErrors', {
      premisesId: premises.id,
      params: ['crn', 'name', 'expectedArrivalDate', 'expectedDepartureDate', 'keyWorker'],
    })
    page.clickSubmit()

    // Then I should see error messages relating to that field
    page.shouldShowErrorMessagesForFields([
      'crn',
      'name',
      'expectedArrivalDate',
      'expectedDepartureDate',
      'keyWorkerId',
    ])
  })

  it('should allow me to see a booking', () => {
    // Given I am signed in
    cy.signIn()

    // And a booking is available
    const premises = premisesFactory.build()
    const booking = bookingFactory.build()
    cy.task('stubBookingGet', { premisesId: premises.id, booking })

    // When I navigate to the booking's manage page
    const page = BookingShowPage.visit(premises.id, booking)

    // Then I should see the details for that booking
    page.shouldShowBookingDetails(booking)
  })
})
