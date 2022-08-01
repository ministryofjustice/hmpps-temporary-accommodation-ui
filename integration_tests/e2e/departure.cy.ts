import premisesFactory from '../../server/testutils/factories/premises'
import departureFactory from '../../server/testutils/factories/departure'
import bookingFactory from '../../server/testutils/factories/booking'

import DepartureCreatePage from '../pages/departureCreate'
import PremisesShowPage from '../pages/premisesShow'

context('Departures', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('creates an departure', () => {
    // Given I am logged in
    cy.signIn()

    // And I have a booking for a premises
    const premises = premisesFactory.buildList(5)
    const booking = bookingFactory.build()
    const departure = departureFactory.build({
      dateTime: new Date(2022, 1, 11, 12, 35).toISOString(),
      reason: 'other',
      destinationAp: premises[2].name,
      moveOnCategory: 'private-rented',
      destinationProvider: 'yorkshire-and-the-humber',
    })

    cy.task('stubPremises', premises)
    cy.task('stubBookingGet', { premisesId: premises[0].id, booking })
    cy.task('stubDepartureCreate', { premisesId: premises[0].id, bookingId: booking.id, departure })

    // When I mark the booking as having departed
    const page = DepartureCreatePage.visit(premises[0].id, booking.id)
    page.verifySummary(booking)
    page.completeForm(departure)

    // Then an departure should be created in the API
    cy.task('verifyDepartureCreate', { premisesId: premises[0].id, booking: booking.id }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.dateTime).equal(departure.dateTime)
      expect(requestBody.reason).equal(departure.reason)
      expect(requestBody.destinationAp).equal(departure.destinationAp)
      expect(requestBody.destinationProvider).equal(departure.destinationProvider)
      expect(requestBody.moveOnCategory).equal(departure.moveOnCategory)
      expect(requestBody.notes).equal(departure.notes)
    })

    // And I should be redirected to the premises page
    PremisesShowPage.verifyOnPage(PremisesShowPage, premises[0])
  })
})
