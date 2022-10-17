import premisesFactory from '../../../server/testutils/factories/premises'
import lostBedFactory from '../../../server/testutils/factories/lostBed'

import { LostBedCreatePage } from '../../../cypress_shared/pages/manage'

import premisesCapacityItemFactory from '../../../server/testutils/factories/dateCapacity'

context('LostBed', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubLostBedReferenceData')
  })

  it('should allow me to create a lost bed', () => {
    // Given I am signed in
    cy.signIn()

    const premises = premisesFactory.build()
    cy.task('stubSinglePremises', premises)

    // When I navigate to the lost bed form
    const lostBed = lostBedFactory.build({
      startDate: '2022-02-11',
      endDate: '2022-03-11',
    })
    cy.task('stubLostBedCreate', { premisesId: premises.id, lostBed })
    cy.task('stubPremisesCapacity', {
      premisesId: premises.id,
      dateCapacities: premisesCapacityItemFactory.buildList(5),
    })

    const page = LostBedCreatePage.visit(premises.id)

    // And I fill out the form
    page.completeForm(lostBed)
    page.clickSubmit()

    // Then a lost bed should have been created in the API
    cy.task('verifyLostBedCreate', {
      premisesId: premises.id,
      lostBed,
    }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.startDate).equal(lostBed.startDate)
      expect(requestBody.endDate).equal(lostBed.endDate)
      expect(requestBody.notes).equal(lostBed.notes)
      expect(requestBody.reason).equal(lostBed.reason.id)
      expect(requestBody.numberOfBeds).equal(lostBed.numberOfBeds.toString())
      expect(requestBody.referenceNumber).equal(lostBed.referenceNumber)
    })

    // And I should be navigated to the premises detail page and see the confirmation message
    page.shouldShowBanner('Lost bed logged')
  })

  it('should show errors', () => {
    // Given I am signed in
    cy.signIn()

    // And a lost bed is available
    const premises = premisesFactory.build()

    // When I navigate to the lost bed form
    const page = LostBedCreatePage.visit(premises.id)

    // And I miss required fields
    cy.task('stubLostBedErrors', {
      premisesId: premises.id,
      params: ['numberOfBeds', 'startDate', 'endDate', 'reason', 'referenceNumber'],
    })

    page.clickSubmit()

    // Then I should see error messages relating to that field
    page.shouldShowErrorMessagesForFields(['numberOfBeds', 'startDate', 'endDate', 'reason', 'referenceNumber'])
  })
})
