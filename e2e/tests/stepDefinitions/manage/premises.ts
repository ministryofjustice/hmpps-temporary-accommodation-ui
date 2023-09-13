import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import type { Premises } from '@approved-premises/api'
import Page from '../../../../cypress_shared/pages/page'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import PremisesEditPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesEdit'
import PremisesListPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesList'
import PremisesNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesNew'
import PremisesShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesShow'
import {
  newPremisesFactory,
  premisesFactory,
  probationRegionFactory,
  updatePremisesFactory,
} from '../../../../server/testutils/factories'
import { getUrlEncodedCypressEnv, throwMissingCypressEnvError } from '../utils'

const actingUserProbationRegionId =
  Cypress.env('acting_user_probation_region_id') || throwMissingCypressEnvError('acting_user_probation_region_id')
const actingUserProbationRegionName =
  getUrlEncodedCypressEnv('acting_user_probation_region_name') ||
  throwMissingCypressEnvError('acting_user_probation_region_name')

const actingUserProbationRegion = { id: actingUserProbationRegionId, name: actingUserProbationRegionName }

Given('I view the list of premises', () => {
  const dashboardPage = Page.verifyOnPage(DashboardPage)
  dashboardPage.clickPremisesLink()

  const premisesListPage = Page.verifyOnPage(PremisesListPage)

  premisesListPage.sampleActivePremises(3, 'premisesList')
})

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

    const premisesShowPage = Page.verifyOnPage(PremisesShowPage, premises)
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

Given('I attempt to create a premises with required details missing', () => {
  const page = Page.verifyOnPage(PremisesNewPage)
  page.clickSubmit()

  cy.wrap(['name', 'addressLine1', 'postcode', 'status']).as('missing')
})

Given('I attempt to create a premises with the PDU missing', () => {
  const page = Page.verifyOnPage(PremisesNewPage)

  page.assignPdus('pdus')
  page.assignLocalAuthorities('localAuthorities')
  page.assignCharacteristics('characteristics')

  cy.then(function _() {
    const premises = premisesFactory
      .forEnvironment(actingUserProbationRegion, this.pdus, this.localAuthorities, this.characteristics)
      .build({
        id: 'unknown',
      })

    const newPremises = newPremisesFactory.fromPremises(premises).build({
      probationDeliveryUnitId: '',
    })

    page.completeForm(newPremises)

    cy.wrap(['probationDeliveryUnitId']).as('missing')
  })
})

Given("I'm editing the premises", () => {
  cy.get('@premises').then(premises => {
    const showPage = Page.verifyOnPage(PremisesShowPage, premises)
    showPage.clickPremisesEditLink()

    const editPage = Page.verifyOnPage(PremisesEditPage, premises)
    editPage.shouldShowPremisesDetails()
  })
})

Given('I edit the premises details', () => {
  cy.get('@premises').then((premises: Premises) => {
    const page = Page.verifyOnPage(PremisesEditPage, premises)

    page.assignPdus('pdus')
    page.assignLocalAuthorities('localAuthorities')
    page.assignCharacteristics('characteristics')

    cy.then(function _() {
      const updatedPremises = premisesFactory
        .forEnvironment(actingUserProbationRegion, this.pdus, this.localAuthorities, this.characteristics)
        .active()
        .build({
          id: premises.id,
          name: premises.name,
        })

      const updatePremises = updatePremisesFactory.fromPremises(updatedPremises).build()

      cy.wrap(updatedPremises).as('premises')
      page.completeForm(updatePremises)
    })
  })
})

Given('I attempt to edit the premises to remove required details', () => {
  cy.get('@premises').then(premises => {
    const page = Page.verifyOnPage(PremisesEditPage, premises)

    page.clearForm()
    page.clickSubmit()

    cy.wrap(['addressLine1', 'postcode', 'probationRegionId']).as('missing')
  })
})

Given('I attempt to edit the premises to remove the PDU', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(PremisesEditPage, this.premises)

    const updatePremises = updatePremisesFactory.fromPremises(this.premises).build({
      probationDeliveryUnitId: '',
    })

    page.completeForm(updatePremises)

    cy.wrap(['probationDeliveryUnitId']).as('missing')
  })
})

Then('I should see only premises for my region', () => {
  const probationRegion = probationRegionFactory.build(actingUserProbationRegion)

  cy.then(function _() {
    this.premisesList.forEach(premises => {
      const premisesListPage = Page.verifyOnPage(PremisesListPage)
      premisesListPage.clickPremisesViewLink(premises)

      const premisesShowPage = Page.verifyOnPage(PremisesShowPage, premises)
      premisesShowPage.shouldShowProbationRegion(probationRegion)
      premisesShowPage.clickBreadCrumbUp()
    })
  })
})

Then('I should see a confirmation for my new premises', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(PremisesShowPage, this.premises)
    page.shouldShowBanner('Property created')

    page.shouldShowPremisesDetails()

    if (this.premises.status === 'archived') {
      page.shouldShowAsArchived()
    } else {
      page.shouldShowAsActive()
    }
  })
})

Then('I should see a list of the problems encountered creating the premises', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(PremisesNewPage)
    page.shouldShowErrorMessagesForFields(this.missing)
  })
})

Then('I should see a confirmation for my updated premises', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(PremisesShowPage, this.premises)
    page.shouldShowBanner('Property updated')

    page.shouldShowPremisesDetails()

    if (this.premises.status === 'archived') {
      page.shouldShowAsArchived()
    } else {
      page.shouldShowAsActive()
    }
  })
})

Then('I should see a list of the problems encountered updating the premises', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(PremisesEditPage, this.premises)
    page.shouldShowErrorMessagesForFields(this.missing)
  })
})
