import premisesFactory from '../../../../server/testutils/factories/premises'
import newPremisesFactory from '../../../../server/testutils/factories/newPremises'
import PremisesNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesNew'
import PremisesListPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesList'
import Page from '../../../../cypress_shared/pages/page'

context('Premises', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('should list all premises', () => {
    // Given I am signed in
    cy.signIn()

    // And there are premises in the database
    const premises = premisesFactory.buildList(5)
    cy.task('stubPremises', { premises, service: 'temporary-accommodation' })

    // When I visit the premises page
    const page = PremisesListPage.visit()

    // Then I should see all of the premises listed
    page.shouldShowPremises(premises)
  })

  it('should navigate to the new premises page', () => {
    // Given I am signed in
    cy.signIn()

    // And there are premises in the database
    const premises = premisesFactory.buildList(5)
    cy.task('stubPremises', { premises, service: 'temporary-accommodation' })

    // When I visit the premises page
    const page = PremisesListPage.visit()

    // Add I click the add a premises button
    page.clickAddPremisesButton()

    // Then I navigate to the new premises page
    Page.verifyOnPage(PremisesNewPage)
  })

  it('should allow me to create a premises', () => {
    // Given I am signed in
    cy.signIn()

    // When I visit the new premises page
    const premises = premisesFactory.build()
    const newPremises = newPremisesFactory.build({
      name: premises.name,
      postcode: premises.postcode,
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
      expect(requestBody.address).equal(newPremises.address)
      expect(requestBody.postcode).equal(newPremises.postcode)
      expect(requestBody.notes.replaceAll('\r\n', '\n')).equal(newPremises.notes)
    })

    // And I should be redirected to the new premises page
    const premisesNewPage = PremisesNewPage.verifyOnPage(PremisesNewPage)
    premisesNewPage.shouldShowBanner('Property created')
  })

  it('should navigate back to the premises list page', () => {
    // Given I am signed in
    cy.signIn()

    // And there are premises in the database
    const premises = premisesFactory.buildList(5)
    cy.task('stubPremises', { premises, service: 'temporary-accommodation' })

    // When I visit the new premises page
    const page = PremisesNewPage.visit()

    // Add I click back
    page.clickBack()

    // Then I navigate to the premises list page
    Page.verifyOnPage(PremisesListPage)
  })
})
