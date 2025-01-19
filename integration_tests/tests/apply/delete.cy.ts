import { TaskListPage } from '../../../cypress_shared/pages/apply'
import { setupTestUser } from '../../../cypress_shared/utils/setupTestUser'
import { applicationFactory } from '../../../server/testutils/factories'

context('Delete application', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser('referrer')
  })

  it('Referrer User has the option to delete an in-progress application', () => {
    // Given there are applications in the database
    const inProgressApplications = applicationFactory.buildList(3, { status: 'inProgress' })
    const firstApplication = inProgressApplications[0]

    cy.task('stubApplications', inProgressApplications)
    cy.task('stubApplicationGet', { application: firstApplication })

    // Given I am signed in
    cy.signIn()

    // When I visit the application show page
    const page = TaskListPage.visit(firstApplication)

    // I have the option to delte the application
    page.shouldShowDeleteOption()
  })
})
