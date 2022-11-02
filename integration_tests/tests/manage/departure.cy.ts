import premisesFactory from '../../../server/testutils/factories/premises'
import departureFactory from '../../../server/testutils/factories/departure'
import bookingFactory from '../../../server/testutils/factories/booking'
import referenceDataFactory from '../../../server/testutils/factories/referenceData'

import { DepartureCreatePage, DepartureConfirmationPage } from '../../../cypress_shared/pages/manage'

context('Departures', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubDepartureReferenceData')
  })

  it('creates a departure', () => {
    // Given I am logged in
    cy.signIn()

    // And I have a booking for a premises
    const premises = premisesFactory.buildList(5)
    const booking = bookingFactory.build()

    const departureReason = referenceDataFactory.departureReasons().build()
    const moveOnCategory = referenceDataFactory.moveOnCategories().build()

    const departure = departureFactory.build({
      dateTime: new Date(2022, 1, 11, 12, 35).toISOString(),
      reason: departureReason,
      moveOnCategory,
    })

    cy.task('stubPremises', premises)
    cy.task('stubBookingGet', { premisesId: premises[0].id, booking })
    cy.task('stubDepartureCreate', { premisesId: premises[0].id, bookingId: booking.id, departure })
    cy.task('stubDepartureGet', { premisesId: premises[0].id, bookingId: booking.id, departure })

    // When I mark the booking as having departed
    const page = DepartureCreatePage.visit(premises[0].id, booking.id)
    page.verifySummary(booking)
    page.completeForm(departure)

    // Then an departure should be created in the API
    cy.task('verifyDepartureCreate', { premisesId: premises[0].id, bookingId: booking.id }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.dateTime).equal(departure.dateTime)
      expect(requestBody.reason).equal(departure.reason.id)
      expect(requestBody.destinationProvider).equal(departure.destinationProvider.id)
      expect(requestBody.moveOnCategory).equal(departure.moveOnCategory.id)
      expect(requestBody.notes).equal(departure.notes)
    })

    // And I should be redirected to the confirmation page
    const departureConfirmationPage = DepartureConfirmationPage.verifyOnPage(
      DepartureConfirmationPage,
      departure,
      booking,
    )

    departureConfirmationPage.verifyConfirmedDepartureIsVisible(departure, booking)
  })

  it('should show errors', () => {
    const premises = premisesFactory.buildList(5)
    const booking = bookingFactory.build()
    const departure = departureFactory.build({
      dateTime: new Date(2022, 1, 11, 12, 35).toISOString(),
    })

    // Given I am signed in
    cy.task('stubPremises', premises)
    cy.task('stubBookingGet', { premisesId: premises[0].id, booking })
    cy.task('stubDepartureGet', { premisesId: premises[0].id, bookingId: booking.id, departure })
    cy.signIn()

    // When I visit the departure page
    const page = DepartureCreatePage.visit(premises[0].id, booking.id)

    // And I miss a required field
    cy.task('stubDepartureErrors', {
      premisesId: premises[0].id,
      bookingId: booking.id,
      params: ['dateTime', 'destinationProvider', 'moveOnCategory', 'reason'],
    })

    page.clickSubmit()

    // Then I should see error messages relating to that field
    page.shouldShowErrorMessagesForFields(['dateTime', 'reason', 'moveOnCategory', 'destinationProvider'])
  })
})
