import { ListPage } from '../../cypress_shared/pages/apply'
import Page from '../../cypress_shared/pages/page'
import DashboardPage from '../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import { setupTestUser, setupTestUserWithoutRole } from '../../cypress_shared/utils/setupTestUser'
import DeliusMissingStaffDetails from '../../cypress_shared/pages/deliusMissingStaffDetails'

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
    Page.verifyOnPage(ListPage, [], [], [])
  })

  it('redirects to the `Delius Missing Staff Details` page a user who is not an assessor or a referrer', () => {
    // Given I am signed in as a user without a role
    setupTestUserWithoutRole()
    cy.signIn({ failOnStatusCode: false })

    // I am redirected to the Delius Missing Staff Details page
    Page.verifyOnPage(DeliusMissingStaffDetails)
  })
})
