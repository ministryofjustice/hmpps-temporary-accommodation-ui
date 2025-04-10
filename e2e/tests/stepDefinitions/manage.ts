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

  cy.visit('/')
  cy.get('input[name="username"]').type(username)
  cy.get('input[name="password"]').type(password, { log: false })
  cy.get('.govuk-button').contains('Sign in').click()

  // temp hack to get local e2es working against dev upstream services - this will only be executed when e2es run locally (i.e. not in the pipeline)
  if (environment === 'local') {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(200)
    cy.visit('/dashboard')
  }
}
