import premisesFactory from '../../../server/testutils/factories/premises'
import nonArrivalFactory from '../../../server/testutils/factories/nonArrival'

import { PremisesShowPage } from '../../../cypress_shared/pages/manage'
import dateCapacityFactory from '../../../server/testutils/factories/dateCapacity'
import NonarrivalCreatePage from '../../../cypress_shared/pages/manage/nonarrivalCreate'

context('Nonarrivals', () => {
  it('creates a non-arrival', () => {
    // Given I am logged in
    cy.signIn()

    // And I have a booking for a premises
    const premises = premisesFactory.build()
    const bookingId = 'some-uuid'
    const nonArrival = nonArrivalFactory.build({
      date: '2021-11-01',
    })

    cy.task('stubSinglePremises', premises)
    cy.task('stubNonArrivalCreate', { premisesId: premises.id, bookingId, nonArrival })
    cy.task('stubPremisesCapacity', {
      premisesId: premises.id,
      dateCapacities: dateCapacityFactory.buildList(5),
    })

    // When I mark the booking as having not arrived
    const page = NonarrivalCreatePage.visit(premises.id, bookingId)
    page.completeNonArrivalForm(nonArrival)

    // Then a non-arrival should be created in the API
    cy.task('verifyNonArrivalCreate', { premisesId: premises.id, bookingId }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.notes).equal(nonArrival.notes)
      expect(requestBody.date).equal(nonArrival.date)
      expect(requestBody.reason).equal('recalled')
    })

    // And I should be redirected to the premises page
    const premisesPage = PremisesShowPage.verifyOnPage(PremisesShowPage, premises)
    premisesPage.shouldShowBanner('Non-arrival logged')
  })

  it('show non-arrival errors when the API returns an error', () => {
    // Given I am logged in
    cy.signIn()

    // And I have a booking for a premises
    const premises = premisesFactory.build()
    const bookingId = 'some-uuid'

    cy.task('stubSinglePremises', premises)

    // When I visit the arrivals page
    const page = NonarrivalCreatePage.visit(premises.id, bookingId)

    // And I miss a required field
    cy.task('stubNonArrivalErrors', {
      premisesId: premises.id,
      bookingId,
      params: ['date', 'reason'],
    })
    page.submitNonArrivalFormWithoutFields()

    // Then I should see error messages relating to that field
    page.shouldShowErrorMessagesForFields(['date', 'reason'])
  })
})
