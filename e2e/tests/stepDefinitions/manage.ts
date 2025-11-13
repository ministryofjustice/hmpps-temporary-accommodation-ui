import { Given } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../cypress_shared/pages/page'
import { throwMissingCypressEnvError } from './utils'

export const environment = Cypress.env('environment') || throwMissingCypressEnvError('environment')

Given('I am logged in as an assessor', () => {
  signIn('assessor_username', 'assessor_password')
})

Given('I am logged in as a referrer', () => {
  signIn('referrer_username', 'referrer_password')
})

Given('I return to the dashboard', () => {
  Page.clickDashboardLink()
})

Given('I go up a breadcrumb level', () => {
  Page.clickBreadCrumbUp()
})

const signIn = (usernameVariable: string, passwordVariable: string) => {
  const username = Cypress.env(usernameVariable) || throwMissingCypressEnvError(usernameVariable)
  const password = Cypress.env(passwordVariable) || throwMissingCypressEnvError(passwordVariable)

  // If the test is run in Cypress UI mode, rewrite auth cookies with strict or lax samesite policy
  // to ensure they work from the Cypress iframe.
  // https://www.tomoliver.net/posts/cypress-samesite-problem
  if (!Cypress.env('CYPRESS_RUN_HEADLESS')) {
    cy.intercept(/^(\/sign-in.*|\/)$/, req =>
      req.on('response', res => {
        const setCookies = res.headers['set-cookie']
        res.headers['set-cookie'] = (Array.isArray(setCookies) ? setCookies : [setCookies])
          .filter(x => x && x.match(/samesite=(lax|strict)/gi))
          .map(headerContent => headerContent.replace(/samesite=(lax|strict)/gi, 'secure; samesite=none'))
      }),
    )
  }

  cy.visit('/')
  cy.get('input[name="username"]').type(username)
  cy.get('input[name="password"]').type(password, { log: false })
  cy.get('.govuk-button').contains('Sign in').click()
}
