import NotAuthorisedPage from '../../cypress_shared/pages/notAuthorised'
import Page from '../../cypress_shared/pages/page'
import { setupTestUser } from '../../cypress_shared/utils/setupTestUser'
import applyPaths from '../../server/paths/apply'
import managePaths from '../../server/paths/temporary-accommodation/manage'
import { TemporaryAccommodationUserRole } from '../../server/@types/shared'

context('Roles', () => {
  beforeEach(() => {
    cy.task('reset')
  })

  it('does not allow an assessor to access applications', () => {
    // Given I am signed in as an assessor
    setupTestUser('assessor')
    cy.signIn()

    // When I attempt to visit the application listing page
    cy.visit(applyPaths.applications.index({}))

    // I am redirected to the not authorised page
    Page.verifyOnPage(NotAuthorisedPage)
  })

  it('does not allow a referrer to access manage', () => {
    // Given there are applications in the database
    cy.task('stubApplications', [])

    // And given I am signed in as a referrer
    setupTestUser('referrer')
    cy.signIn()

    // When I attempt to visit the dashboard page
    cy.visit(managePaths.dashboard.index({}))

    // I am redirected to the not authorised page
    Page.verifyOnPage(NotAuthorisedPage)
  })

  it('does not allow a reporter to access applications', () => {
    // Given there are applications in the database
    cy.task('stubApplications', [])
    cy.task('stubReportReferenceData')

    // And given I am signed in as a reporter
    setupTestUser('reporter' as TemporaryAccommodationUserRole)
    cy.signIn()

    // When I attempt to visit the application listing page
    cy.visit(applyPaths.applications.index({}))

    // I am redirected to the not authorised page
    Page.verifyOnPage(NotAuthorisedPage)
  })

  it('does not allow a reporter to access manage pages that is not reports', () => {
    // Given there are assessments in the database
    cy.task('stubAssessments', [])
    cy.task('stubReportReferenceData')

    // And given I am signed in as a reporter
    setupTestUser('reporter' as TemporaryAccommodationUserRole)
    cy.signIn()

    // When I attempt to visit the dashboard page
    cy.visit(managePaths.dashboard.index({}))

    // I am redirected to the not authorised page
    Page.verifyOnPage(NotAuthorisedPage)
  })
})
