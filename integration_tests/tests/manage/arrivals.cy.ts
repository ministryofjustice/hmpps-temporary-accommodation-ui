import premisesFactory from '../../../server/testutils/factories/premises'
import arrivalFactory from '../../../server/testutils/factories/arrival'

import { ArrivalCreatePage, PremisesShowPage } from '../../../cypress_shared/pages/manage'
import dateCapacityFactory from '../../../server/testutils/factories/dateCapacity'
import staffMemberFactory from '../../../server/testutils/factories/staffMember'

const staff = staffMemberFactory.buildList(5)

context('Arrivals', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('creates an arrival', () => {
    // Given I am logged in
    cy.signIn()

    // And I have a booking for a premises
    const premises = premisesFactory.build()
    const bookingId = 'some-uuid'
    const arrival = arrivalFactory.build({
      arrivalDate: '2022-11-11',
      expectedDepartureDate: '2022-12-11',
    })

    cy.task('stubPremisesStaff', { premisesId: premises.id, staff })
    cy.task('stubSinglePremises', premises)
    cy.task('stubArrivalCreate', { premisesId: premises.id, bookingId, arrival })
    cy.task('stubPremisesCapacity', {
      premisesId: premises.id,
      dateCapacities: dateCapacityFactory.buildList(5),
    })

    // When I mark the booking as having arrived
    const page = ArrivalCreatePage.visit(premises.id, bookingId)
    page.completeArrivalForm(arrival, staff[0].id.toString())

    // Then an arrival should be created in the API
    cy.task('verifyArrivalCreate', { premisesId: premises.id, bookingId }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      const { arrivalDate, expectedDepartureDate } = arrival

      expect(requestBody.notes).equal(arrival.notes)
      expect(requestBody.arrivalDate).equal(arrivalDate)
      expect(requestBody.keyWorkerStaffId).equal(staff[0].id.toString())
      expect(requestBody.expectedDepartureDate).equal(expectedDepartureDate)
    })

    // And I should be redirected to the premises page
    const premisesPage = PremisesShowPage.verifyOnPage(PremisesShowPage, premises)
    premisesPage.shouldShowBanner('Arrival logged')
  })

  it('show arrival errors when the API returns an error', () => {
    // Given I am logged in
    cy.signIn()

    // And I have a booking for a premises
    const premises = premisesFactory.build()
    const bookingId = 'some-uuid'

    cy.task('stubSinglePremises', premises)
    cy.task('stubPremisesStaff', { premisesId: premises.id, staff })

    // When I visit the arrivals page
    const page = ArrivalCreatePage.visit(premises.id, bookingId)

    // And I miss a required field
    cy.task('stubArrivalErrors', {
      premisesId: premises.id,
      bookingId,
      params: ['date', 'expectedDepartureDate', 'keyWorkerStaffId'],
    })
    page.submitArrivalFormWithoutFields()

    // Then I should see error messages relating to that field
    page.shouldShowErrorMessagesForFields(['date', 'expectedDepartureDate'])
  })
})
