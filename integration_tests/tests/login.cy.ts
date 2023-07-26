import AuthManageDetailsPage from '../../cypress_shared/pages/authManageDetails'
import AuthSignInPage from '../../cypress_shared/pages/authSignIn'
import Page from '../../cypress_shared/pages/page'
import DashboardPage from '../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import { setupTestUser } from '../../cypress_shared/utils/setupTestUser'
import { referenceDataFactory, userFactory } from '../../server/testutils/factories'

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
    cy.task('stubAuthUser', 'bobby brown')

    const probationRegion = referenceDataFactory.probationRegion().build({
      name: 'Another region',
    })
    const actingUser = userFactory.build({ region: probationRegion, roles: ['assessor', 'referrer'] })

    cy.task('stubActingUser', actingUser)
    cy.signIn()

    indexPage.headerUserName().contains('B. Brown')
    indexPage.headerProbationRegion().contains('Another region')
  })
})
