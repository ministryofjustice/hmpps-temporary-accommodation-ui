import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'

import { PremisesShowPage, LostBedCreatePage } from '../../../cypress_shared/pages/manage'
import lostBedFactory from '../../../server/testutils/factories/lostBed'
import referenceDataFactory from '../../../server/testutils/factories/referenceData'
import throwMissingCypressEnvError from './utils'

Given('I create a lost bed', () => {
  const lostBedReasonId = Cypress.env('lost_bed_reason_id') || throwMissingCypressEnvError('lost_bed_reason_id')

  cy.get('@premisesShowPage').then((premisesShowPage: PremisesShowPage) => {
    premisesShowPage.clickLostBedsOption()
  })

  const lostBedCreatePage = new LostBedCreatePage()

  const lostBed = lostBedFactory.build({
    startDate: new Date(2022, 1, 11, 0, 0).toISOString(),
    endDate: new Date(2022, 2, 11, 0, 0).toISOString(),
    reason: referenceDataFactory.build({ id: lostBedReasonId }),
  })

  lostBedCreatePage.completeForm(lostBed)
  lostBedCreatePage.clickSubmit()
})

Given('I attempt to create a lost bed without the necessary information', () => {
  cy.get('@premisesShowPage').then((premisesShowPage: PremisesShowPage) => {
    premisesShowPage.clickLostBedsOption()
  })

  const lostBedCreatePage = new LostBedCreatePage()
  cy.wrap(lostBedCreatePage).as('lostBedCreatePage')

  lostBedCreatePage.clickSubmit()
})

Then('I should see a notification that the lost bed has been created', () => {
  cy.get('@premisesShowPage').then((premisesShowPage: PremisesShowPage) => {
    premisesShowPage.shouldShowBanner('Lost bed logged')
  })
})

Then('I should see a list of the problems encountered creating the lost bed', () => {
  cy.get('@lostBedCreatePage').then((lostBedCreatePage: LostBedCreatePage) => {
    lostBedCreatePage.shouldShowErrorMessagesForFields(['startDate', 'endDate', 'numberOfBeds', 'reason'])
  })
})
