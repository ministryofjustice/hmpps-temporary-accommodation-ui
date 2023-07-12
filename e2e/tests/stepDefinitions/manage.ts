import { Given } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../cypress_shared/pages/page'
import { throwMissingCypressEnvError } from './utils'

Given('I am logged in as an assessor', () => {
  const username = Cypress.env('assessor_username') || throwMissingCypressEnvError('assessor_username')
  const password = Cypress.env('assessor_password') || throwMissingCypressEnvError('assessor_password')

  cy.visit('/')
  cy.get('input[name="username"]').type(username)
  cy.get('input[name="password"]').type(password, { log: false })

  cy.get('.govuk-button').contains('Sign in').click()
})

Given('I am logged in as a referrer', () => {
  const username = Cypress.env('referrer_username') || throwMissingCypressEnvError('referrer_username')
  const password = Cypress.env('referrer_password') || throwMissingCypressEnvError('referrer_password')

  cy.visit('/')
  cy.get('input[name="username"]').type(username)
  cy.get('input[name="password"]').type(password, { log: false })

  cy.get('.govuk-button').contains('Sign in').click()
})

Given('I return to the dashboard', () => {
  Page.clickDashboardLink()
})

Given('I go up a breadcrumb level', () => {
  Page.clickBreadCrumbUp()
})
