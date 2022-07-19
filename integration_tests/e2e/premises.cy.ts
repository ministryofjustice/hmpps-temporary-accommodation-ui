import premisesFactory from '../../server/testutils/factories/premises'
import PremisesPage from '../pages/premises'

context('Premises', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('should list all premises', () => {
    // Given there are premises in the database
    const premises = premisesFactory.buildList(5)
    cy.task('stubPremises', premises)

    // And I am signed in
    cy.signIn()

    // When I visit the premises page
    const page = PremisesPage.visit()

    // Then I should see all of the premises listed
    page.shouldShowPremises(premises)
  })
})
