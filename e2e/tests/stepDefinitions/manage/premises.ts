import type { Premises } from '@approved-premises/api'
import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import premisesFactory from '../../../../server/testutils/factories/premises'
import newPremisesFactory from '../../../../server/testutils/factories/newPremises'
import updatePremisesFactory from '../../../../server/testutils/factories/updatePremises'
import probationRegionFactory from '../../../../server/testutils/factories/probationRegion'
import PremisesNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesNew'
import PremisesListPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesList'
import PremisesShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesShow'
import PremisesEditPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesEdit'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import Page from '../../../../cypress_shared/pages/page'
import throwMissingCypressEnvError from '../utils'

const actingUserProbationRegionId =
  Cypress.env('acting_user_probation_region_id') || throwMissingCypressEnvError('acting_user_probation_region_id')
const actingUserProbationRegionName =
  Cypress.env('acting_user_probation_region_name') || throwMissingCypressEnvError('acting_user_probation_region_name')

Given("I'm creating a premises", () => {
  const dashboardPage = Page.verifyOnPage(DashboardPage)
  dashboardPage.clickPremisesLink()

  const premisesListPage = Page.verifyOnPage(PremisesListPage)
  premisesListPage.clickAddPremisesButton()
})

Given("I'm viewing an existing premises", () => {
  const dashboardPage = Page.verifyOnPage(DashboardPage)
  dashboardPage.clickPremisesLink()

  const premisesListPage = Page.verifyOnPage(PremisesListPage)
  premisesListPage.getAnyPremises('premises')

  cy.get('@premises').then(premises => {
    premisesListPage.clickPremisesViewLink(premises)
  })
})

Given('I create a premises with all necessary details', () => {
  const page = Page.verifyOnPage(PremisesNewPage)

  const probationRegion = probationRegionFactory.build({
    id: actingUserProbationRegionId,
    name: actingUserProbationRegionName,
  })
  const premises = premisesFactory.build({
    id: 'unknown',
    probationRegion,
  })

  page.shouldPreselectProbationRegion(probationRegion)

  const newPremises = newPremisesFactory.build({
    ...premises,
    localAuthorityAreaId: premises.localAuthorityArea.id,
    characteristicIds: premises.characteristics.map(characteristic => characteristic.id),
    probationRegionId: premises.probationRegion.id,
  })

  cy.wrap(premises).as('premises')
  page.completeForm(newPremises)
})

Given('I attempt to create a premises with required details missing', () => {
  const page = Page.verifyOnPage(PremisesNewPage)
  page.clickSubmit()

  cy.wrap(['name', 'addressLine1', 'postcode', 'probationRegionId', 'status']).as('missing')
})

Given('I attempt to create a premises with the PDU missing', () => {
  const page = Page.verifyOnPage(PremisesNewPage)

  const probationRegion = probationRegionFactory.build({
    id: actingUserProbationRegionId,
    name: actingUserProbationRegionName,
  })
  const premises = premisesFactory.build({
    id: 'unknown',
    probationRegion,
    pdu: '',
  })

  const newPremises = newPremisesFactory.build({
    ...premises,
    localAuthorityAreaId: premises.localAuthorityArea.id,
    characteristicIds: premises.characteristics.map(characteristic => characteristic.id),
    probationRegionId: premises.probationRegion.id,
  })

  page.completeForm(newPremises)

  cy.wrap(['pdu']).as('missing')
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

    const probationRegion = probationRegionFactory.build({
      id: actingUserProbationRegionId,
      name: actingUserProbationRegionName,
    })
    const updatedPremises = premisesFactory.build({
      id: premises.id,
      name: premises.name,
      probationRegion,
    })

    const updatePremises = updatePremisesFactory.build({
      ...updatedPremises,
      localAuthorityAreaId: updatedPremises.localAuthorityArea.id,
      characteristicIds: updatedPremises.characteristics.map(characteristic => characteristic.id),
      probationRegionId: updatedPremises.probationRegion.id,
    })

    cy.wrap(updatedPremises).as('premises')
    page.completeForm(updatePremises)
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

    const probationRegion = probationRegionFactory.build({
      id: actingUserProbationRegionId,
      name: actingUserProbationRegionName,
    })
    const updatedPremises = premisesFactory.build({
      id: this.premises.id,
      name: this.premises.name,
      probationRegion,
      pdu: '',
    })

    const updatePremises = updatePremisesFactory.build({
      ...updatedPremises,
      localAuthorityAreaId: updatedPremises.localAuthorityArea.id,
      characteristicIds: updatedPremises.characteristics.map(characteristic => characteristic.id),
      probationRegionId: updatedPremises.probationRegion.id,
    })

    page.completeForm(updatePremises)

    cy.wrap(['pdu']).as('missing')
  })
})

Then('I should see a confirmation for my new premises', () => {
  cy.get('@premises').then(premises => {
    const page = Page.verifyOnPage(PremisesShowPage, premises)
    page.shouldShowBanner('Property created')

    page.shouldShowPremisesDetails()
  })
})

Then('I should see a list of the problems encountered creating the premises', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(PremisesNewPage)
    page.shouldShowErrorMessagesForFields(this.missing)
  })
})

Then('I should see a confirmation for my updated premises', () => {
  cy.get('@premises').then(premises => {
    const page = Page.verifyOnPage(PremisesShowPage, premises)
    page.shouldShowBanner('Property updated')

    page.shouldShowPremisesDetails()
  })
})

Then('I should see a list of the problems encountered updating the premises', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(PremisesEditPage, this.premises)
    page.shouldShowErrorMessagesForFields(this.missing)
  })
})
