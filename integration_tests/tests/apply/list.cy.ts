import { ListPage, StartPage } from '../../../cypress_shared/pages/apply'

import Page from '../../../cypress_shared/pages/page'
import { setupTestUser } from '../../../cypress_shared/utils/setupTestUser'
import { applicationFactory } from '../../../server/testutils/factories'

context('Applications dashboard', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser('referrer')
  })

  it('shows the dashboard ', () => {
    // Given there are applications in the database
    const inProgressApplications = applicationFactory.buildList(5, { status: 'inProgress' })
    const submittedApplications = applicationFactory.buildList(5, { status: 'submitted' })

    cy.task('stubApplications', [inProgressApplications, submittedApplications].flat())

    // And given I am logged in
    cy.signIn()

    // When I visit the Previous Applications page
    const page = ListPage.visit(inProgressApplications)

    // Then I should see all of the in progress applications
    page.shouldShowInProgressApplications()

    // And I the button should take me to the application start page
    page.clickSubmit()

    Page.verifyOnPage(StartPage)
  })
})
