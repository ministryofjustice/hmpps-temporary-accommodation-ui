import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import PremisesListPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesList'
import PremisesNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesNew'
import PremisesShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesShow'
import { newPremisesFactory, premisesFactory } from '../../../../server/testutils/factories'
import { getUrlEncodedCypressEnv, throwMissingCypressEnvError } from '../utils'

const actingUserProbationRegionId =
  Cypress.env('acting_user_probation_region_id') || throwMissingCypressEnvError('acting_user_probation_region_id')
const actingUserProbationRegionName =
  getUrlEncodedCypressEnv('acting_user_probation_region_name') ||
  throwMissingCypressEnvError('acting_user_probation_region_name')

const actingUserProbationRegion = { id: actingUserProbationRegionId, name: actingUserProbationRegionName }

Given("I'm creating a premises", () => {
  const dashboardPage = Page.verifyOnPage(DashboardPage)
  dashboardPage.clickPremisesLink()

  const premisesListPage = Page.verifyOnPage(PremisesListPage)
  premisesListPage.clickAddPremisesButton()
})

Given('I view an existing active premises', () => {
  const dashboardPage = Page.verifyOnPage(DashboardPage)
  dashboardPage.clickPremisesLink()

  const premisesListPage = Page.verifyOnPage(PremisesListPage)
  premisesListPage.sampleActivePremises(1, 'premisesList')

  cy.then(function _() {
    const premises = this.premisesList[0]
    premisesListPage.clickPremisesViewLink(premises)

    const premisesShowPage = Page.verifyOnPage(PremisesShowPage, premises.addressLine1)
    premisesShowPage.getPremises('premises')
  })
})

Given('I create an active premises with all necessary details', () => {
  const page = Page.verifyOnPage(PremisesNewPage)

  page.assignPdus('pdus')
  page.assignLocalAuthorities('localAuthorities')
  page.assignCharacteristics('characteristics')

  cy.then(function _() {
    const premises = premisesFactory
      .forEnvironment(actingUserProbationRegion, this.pdus, this.localAuthorities, this.characteristics)
      .active()
      .build({
        id: 'unknown',
      })

    page.shouldPreselectProbationRegion(premises.probationRegion)

    const newPremises = newPremisesFactory.fromPremises(premises).build()

    cy.wrap(premises).as('premises')
    page.completeForm(newPremises)
  })
})

Then('I should see a list of the problems encountered creating the premises', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(PremisesNewPage)
    page.shouldShowErrorMessagesForFields(this.missing)
  })
})
