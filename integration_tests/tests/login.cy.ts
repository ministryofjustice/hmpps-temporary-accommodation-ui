import AuthManageDetailsPage from '../../cypress_shared/pages/authManageDetails'
import AuthSignInPage from '../../cypress_shared/pages/authSignIn'
import Page from '../../cypress_shared/pages/page'
import DashboardPage from '../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import { setupTestUser } from '../../cypress_shared/utils/setupTestUser'
import { referenceDataFactory, userFactory, userProfileFactory } from '../../server/testutils/factories'
import DeliusMissingStaffDetails from '../../cypress_shared/pages/deliusMissingStaffDetails'

context('SignIn', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser('assessor')
  })

  it('Unauthenticated user directed to auth', () => {
    cy.visit('/')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Unauthenticated user navigating to sign in page directed to auth', () => {
    cy.visit('/sign-in')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Shows the user a specific error page if their account is missing a staff record', () => {
    const profile = userProfileFactory.build({ user: userFactory.build(), loadError: 'staff_record_not_found' })
    cy.task('stubUserProfile', profile)
    cy.signIn()

    Page.verifyOnPage(DeliusMissingStaffDetails)
  })

  it('User name visible in header', () => {
    cy.signIn()
    const indexPage = Page.verifyOnPage(DashboardPage)
    indexPage.headerUserName().should('contain.text', 'J. Smith')
  })

  it('Probation region visible in header', () => {
    cy.signIn()
    const indexPage = Page.verifyOnPage(DashboardPage)

    cy.then(function _() {
      indexPage.headerProbationRegion().should('contain.text', this.actingUserProbationRegion.name)
    })
  })

  it('User can log out', () => {
    cy.signIn()
    const indexPage = Page.verifyOnPage(DashboardPage)
    indexPage.signOut().click()
    Page.verifyOnPage(AuthSignInPage)
  })

  it('User can manage their details', () => {
    cy.signIn()
    const indexPage = Page.verifyOnPage(DashboardPage)

    indexPage.manageDetails().get('a').invoke('removeAttr', 'target')
    indexPage.manageDetails().click()
    Page.verifyOnPage(AuthManageDetailsPage)
  })

  it('Token verification failure takes user to sign in page', () => {
    cy.signIn()
    Page.verifyOnPage(DashboardPage)
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/').its('body').should('contain', 'Sign in')
  })

  it('Token verification failure clears user session', () => {
    cy.signIn()
    const indexPage = Page.verifyOnPage(DashboardPage)
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/').its('body').should('contain', 'Sign in')

    cy.task('stubVerifyToken', true)

    const probationRegion = referenceDataFactory.probationRegion().build({
      name: 'Another region',
    })
    const actingUser = userFactory.build({
      name: 'bobby brown',
      region: probationRegion,
      roles: ['assessor', 'referrer'],
    })
    const userProfile = userProfileFactory.build({ user: actingUser })

    cy.task('stubUserProfile', userProfile)
    cy.signIn()

    indexPage.headerUserName().contains('B. Brown')
    indexPage.headerProbationRegion().contains('Another region')
  })
})
