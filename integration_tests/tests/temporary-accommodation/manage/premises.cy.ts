import premisesFactory from '../../../../server/testutils/factories/premises'
import newPremisesFactory from '../../../../server/testutils/factories/newPremises'
import PremisesNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesNew'

context('Premises', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('should allow me to create a premises', () => {
    // Given I am signed in
    cy.signIn()

    // When I visit the new premises page
    const premises = premisesFactory.build()
    const newPremises = newPremisesFactory.build({
      name: premises.name,
      apCode: premises.apCode,
      postcode: premises.postcode,
      bedCount: premises.bedCount,
    })

    cy.task('stubPremisesCreate', premises)

    const page = PremisesNewPage.visit()

    // And I fill out the form
    page.completeForm(newPremises)

    // Then a premises should have been created in the API
    cy.task('verifyPremisesCreate').then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.name).equal(newPremises.name)
      expect(requestBody.apCode).equal(newPremises.apCode)
      expect(requestBody.postcode).equal(newPremises.postcode)
      expect(requestBody.bedCount).equal(newPremises.bedCount)
    })

    // And I should be redirected to the new premises page
    const premisesNewPage = PremisesNewPage.verifyOnPage(PremisesNewPage)
    premisesNewPage.shouldShowBanner('Property created')
  })
})
