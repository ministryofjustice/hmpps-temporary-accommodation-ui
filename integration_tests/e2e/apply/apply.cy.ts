import { StartPage, EnterCRNPage, ConfirmDetailsPage } from '../../pages/apply'

import personFactory from '../../../server/testutils/factories/person'

context('Apply', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('shows the details of a person from their CRN', () => {
    // Given I am logged in
    cy.signIn()

    // And a person is in Delius
    const person = personFactory.build()
    cy.task('stubFindPerson', { person })

    // And I have started an application
    const startPage = StartPage.visit()
    startPage.startApplication()

    // When I enter a CRN
    const crnPage = new EnterCRNPage()
    crnPage.enterCrn(person.crn)
    crnPage.clickSubmit()

    // Then I should see the person's detail
    const confirmDetailsPage = new ConfirmDetailsPage(person)
    confirmDetailsPage.verifyPersonIsVisible()
  })
})
