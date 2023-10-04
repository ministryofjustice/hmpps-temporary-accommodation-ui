import { ListPage } from '../../cypress_shared/pages/apply'
import NotAuthorisedPage from '../../cypress_shared/pages/notAuthorised'
import Page from '../../cypress_shared/pages/page'
import DashboardPage from '../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import { setupTestUser, setupTestUserWithoutRole } from '../../cypress_shared/utils/setupTestUser'

context('Landing', () => {
  beforeEach(() => {
    cy.task('reset')
  })

  it('redirects an assessor to the dashboard page', () => {
    // Given I am signed in as an assessor
    setupTestUser('assessor')
    cy.signIn()

    // I am redirected to the dashboard page
    Page.verifyOnPage(DashboardPage)
  })

  it('redirects a referrer to the application listing page', () => {
    // Given there are applications in the database
    cy.task('stubApplications', [])

    // And given I am signed in as a referrer
    setupTestUser('referrer')
    cy.signIn()

    // I am redirected to the application listing page
    Page.verifyOnPage(ListPage, [], [])
  })

  it('redirects a user who is not an assessor or a referrer', () => {
    // Given I am signed in as a user without a role
    setupTestUserWithoutRole()
    cy.signIn()

    // I am redirected to the not authorised page
    Page.verifyOnPage(NotAuthorisedPage)
  })
})
