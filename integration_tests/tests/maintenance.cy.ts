import config from '../../server/config'
import { setupTestUser } from '../../cypress_shared/utils/setupTestUser'
import Page from '../../cypress_shared/pages/page'
import MaintenancePage from '../../cypress_shared/pages/maintenance'
import DashboardPage from '../../cypress_shared/pages/temporary-accommodation/dashboardPage'

context('Maintenance', () => {
  beforeEach(() => {
    cy.task('reset')

    // Given maintenance mode is enabled
    config.flags.maintenanceMode = true
  })

  afterEach(() => {
    config.flags.maintenanceMode = false
  })

  it.skip('redirects an assessor to the maintenance page', () => {
    // When I sign in as an assessor
    setupTestUser('assessor')
    cy.signIn()

    // Then I am redirected to the maintenance page
    Page.verifyOnPage(MaintenancePage)
  })

  it.skip('allows an admin with an assessor role to access the dashboard', () => {
    // When I sign in with admin and assessor roles
    setupTestUser('admin', 'assessor')
    cy.signIn()

    // Then I am redirected to the dashboard page
    Page.verifyOnPage(DashboardPage)
  })
})
