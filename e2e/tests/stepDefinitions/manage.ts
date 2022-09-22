import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'

import { BookingNewPage, BookingConfirmationPage, BookingFindPage } from '../../../cypress_shared/pages/manage'

import bookingFactory from '../../../server/testutils/factories/booking'
import personFactory from '../../../server/testutils/factories/person'
import keyWorkerFactory from '../../../server/testutils/factories/keyWorker'

const keyWorker = keyWorkerFactory.build({ name: Cypress.env('keyworker_name') })
const person = personFactory.build({ name: Cypress.env('offender_name'), crn: Cypress.env('offender_crn') })
const booking = bookingFactory.build({ keyWorker, person })

Given('I am logged in', () => {
  cy.visit('/')
  cy.get('input[name="username"]').type(Cypress.env('username'))
  cy.get('input[name="password"]').type(Cypress.env('password'))

  cy.get('.govuk-button').contains('Sign in').click()
})

Given('I see a list of premises', () => {
  cy.get('h1').should('contain', 'Approved Premises')
  cy.get('.govuk-table tbody tr').its('length').should('be.gt', 0)
})

Given('I choose a premises', () => {
  cy.get('.govuk-table tbody tr a').first().click()
})

Given('I create a booking', () => {
  cy.get('.moj-button-menu__toggle-button')
    .click()
    .then(() => cy.get('a').contains('Create a booking').click())

  const bookingNewPage = new BookingFindPage()
  bookingNewPage.enterCrn(person.crn)
  bookingNewPage.clickSubmit()

  const form = new BookingNewPage()

  form.verifyPersonIsVisible(person)
  form.completeForm(booking)
  form.clickSubmit()
})

Then('I should see a confirmation screen', () => {
  const page = new BookingConfirmationPage()

  page.verifyBookingIsVisible(booking)
})
