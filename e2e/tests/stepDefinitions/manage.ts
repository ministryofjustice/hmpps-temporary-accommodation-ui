import { Given } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../cypress_shared/pages/page'
import { throwMissingCypressEnvError } from './utils'

Given('I am logged in', () => {
  const username = Cypress.env('username') || throwMissingCypressEnvError('username')
  const password = Cypress.env('password') || throwMissingCypressEnvError('password')

  cy.visit('/')
  cy.get('input[name="username"]').type(username)
  cy.get('input[name="password"]').type(password, { log: false })

  cy.get('.govuk-button').contains('Sign in').click()
})

Given('I return to the dashboard', () => {
  Page.clickDashboardLink()
})
