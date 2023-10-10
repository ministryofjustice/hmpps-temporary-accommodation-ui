import { ListPage, TaskListPage } from '../../../cypress_shared/pages/apply'

import Page from '../../../cypress_shared/pages/page'
import { setupTestUser } from '../../../cypress_shared/utils/setupTestUser'
import { applicationFactory } from '../../../server/testutils/factories'

context('Application Page', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser('referrer')
  })

  it('navigates back from the show application page to the list applications page', () => {
    // Given there are applications in the database
    const inProgressApplications = applicationFactory.buildList(3, { status: 'inProgress' })
    const firstApplication = inProgressApplications[0]

    cy.task('stubApplications', inProgressApplications)
    cy.task('stubApplicationGet', { application: firstApplication })

    // Given I am signed in
    cy.signIn()

    // When I visit the application show page
    const page = TaskListPage.visit(firstApplication)

    // And I click the back link
    page.clickBack()

    // Then I navigate to the list application page
    Page.verifyOnPage(ListPage, inProgressApplications, [])
  })
})
