import { Given } from '@badeball/cypress-cucumber-preprocessor'

Given('I am logged in', () => {
  cy.visit('/')
  cy.get('input[name="username"]').type(Cypress.env('username'))
  cy.get('input[name="password"]').type(Cypress.env('password'))

  cy.get('.govuk-button').contains('Sign in').click()
})

Given('I access the premises homepage', () => {
  cy.visit('/premises')
})

Given('I see a list of premises', () => {
  cy.get('h1').should('contain', 'Approved Premises')
  cy.get('.govuk-table tbody tr').its('length').should('be.gt', 0)
})

Given('I choose a premises', () => {
  cy.get('.govuk-table tbody tr a').first().click()
})
