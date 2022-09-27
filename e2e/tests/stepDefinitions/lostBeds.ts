import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'

import { LostBedCreatePage } from '../../../cypress_shared/pages/manage'
import lostBedFactory from '../../../server/testutils/factories/lostBed'
import referenceDataFactory from '../../../server/testutils/factories/referenceData'

Given('I navigate to the lost beds create page', () => {
  cy.get('.moj-button-menu__toggle-button')
    .click()
    .then(() => cy.get('a').contains('Record a lost bed').click())
})

Given('I create a lost bed', () => {
  const lostBed = lostBedFactory.build({
    startDate: new Date(2022, 1, 11, 0, 0).toISOString(),
    endDate: new Date(2022, 2, 11, 0, 0).toISOString(),
    reason: referenceDataFactory.build({ id: Cypress.env('lost_bed_reason_id') }),
  })

  const lostBedCreatePage = new LostBedCreatePage()

  lostBedCreatePage.completeForm(lostBed)
  lostBedCreatePage.clickSubmit()
})

Given('I attempt to create a lost bed without the necessary information', () => {
  const lostBedCreatePage = new LostBedCreatePage()
  lostBedCreatePage.clickSubmit()
})

Then('I should see a notification that the lost bed has been created', () => {
  cy.get('.govuk-notification-banner').should('contain', 'Lost bed logged')
})

Then('I should see a list of the problems encountered creating the lost bed', () => {
  const lostBedCreatePage = new LostBedCreatePage()
  lostBedCreatePage.shouldShowErrorMessagesForFields(['startDate', 'endDate', 'numberOfBeds', 'reason'])
})
