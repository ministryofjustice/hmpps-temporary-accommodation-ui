import premisesFactory from '../../server/testutils/factories/premises'
import PremisesListPage from '../pages/premisesList'
import PremisesShowPage from '../pages/premisesShow'

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
    const page = PremisesListPage.visit()

    // Then I should see all of the premises listed
    page.shouldShowPremises(premises)
  })

  it('should show a single premises', () => {
    // Given there is a premises in the database
    const premises = premisesFactory.build()
    cy.task('subSinglePremises', premises)

    // And I am signed in
    cy.signIn()

    // When I visit the premises page
    const page = PremisesShowPage.visit(premises)

    // Then I should see the premises details shown
    page.shouldShowPremisesDetail()
  })
})
