import { Given } from '@badeball/cypress-cucumber-preprocessor'
import throwMissingError from './utils'
import premisesFactory from '../../../server/testutils/factories/premises'
import { PremisesShowPage } from '../../../cypress_shared/pages/manage'

Given('I am logged in', () => {
  const username = Cypress.env('username') || throwMissingError('username')
  const password = Cypress.env('password') || throwMissingError('password')

  cy.visit('/')
  cy.get('input[name="username"]').type(username)
  cy.get('input[name="password"]').type(password, { log: false })

  cy.get('.govuk-button').contains('Sign in').click()
})

Given("I'm managing a premises", () => {
  cy.visit('/premises')
  cy.get('.govuk-table tbody tr')
    .first()
    .within($row => {
      cy.wrap($row).get('th').first().invoke('text').as('premisesName')
      cy.wrap($row).get('a').click()
    })

  cy.get('@premisesName').then(premisesName => {
    const premises = premisesFactory.build({ name: premisesName })
    const premisesShowPage = new PremisesShowPage(premises)
    cy.wrap(premisesShowPage).as('premisesShowPage')
  })
})
