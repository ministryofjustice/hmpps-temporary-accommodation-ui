import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import throwMissingCypressEnvError from './utils'
import premisesFactory from '../../../server/testutils/factories/premises'
import newPremisesFactory from '../../../server/testutils/factories/newPremises'
import updatePremisesFactory from '../../../server/testutils/factories/updatePremises'
import localAuthorityFactory from '../../../server/testutils/factories/localAuthority'
import characteristicFactory from '../../../server/testutils/factories/characteristic'
import PremisesNewPage from '../../../cypress_shared/pages/temporary-accommodation/manage/premisesNew'
import PremisesListPage from '../../../cypress_shared/pages/temporary-accommodation/manage/premisesList'
import PremisesShowPage from '../../../cypress_shared/pages/temporary-accommodation/manage/premisesShow'
import PremisesEditPage from '../../../cypress_shared/pages/temporary-accommodation/manage/premisesEdit'

Given('I am logged in', () => {
  const username = Cypress.env('username') || throwMissingCypressEnvError('username')
  const password = Cypress.env('password') || throwMissingCypressEnvError('password')

  cy.visit('/')
  cy.get('input[name="username"]').type(username)
  cy.get('input[name="password"]').type(password, { log: false })

  cy.get('.govuk-button').contains('Sign in').click()
})

Given("I'm creating a premises", () => {
  const page = PremisesListPage.visit()
  page.clickAddPremisesButton()
})

Given('I create a premises with all necessary details', () => {
  const page = PremisesNewPage.verifyOnPage(PremisesNewPage)

  page.getLocalAuthorityAreaIdByLabel('North Lanarkshire', 'localAuthorityAreaId')

  page.getCharacteristicIdByLabel('Not suitable for arson offenders', 'arsonCharacteristicId')
  page.getCharacteristicIdByLabel('School nearby', 'schooNearbyCharacteristicId')

  cy.then(function _() {
    const { localAuthorityAreaId } = this
    const { arsonCharacteristicId } = this
    const { schooNearbyCharacteristicId } = this

    const newPremises = newPremisesFactory.build({
      localAuthorityAreaId,
      characteristicIds: [arsonCharacteristicId, schooNearbyCharacteristicId],
    })

    const premises = premisesFactory.build({
      id: 'unknown',
      ...newPremises,
      localAuthorityArea: localAuthorityFactory.build({
        name: 'North Lanarkshire',
        id: localAuthorityAreaId,
      }),
      characteristics: [
        characteristicFactory.build({
          name: 'Not suitable for arson offenders',
          id: arsonCharacteristicId,
        }),
        characteristicFactory.build({
          name: 'School nearby',
          id: schooNearbyCharacteristicId,
        }),
      ],
    })

    cy.wrap(premises).as('premises')
    page.completeForm(newPremises)
  })
})

Given('I attempt to create a premises with required details missing', () => {
  const page = PremisesNewPage.verifyOnPage(PremisesNewPage)
  page.clickSubmit()
})

Given("I'm editing the premises", () => {
  const listPage = PremisesListPage.visit()

  cy.get('@premises').then(premises => {
    listPage.clickPremisesViewLink(premises)
    const showPage = PremisesShowPage.verifyOnPage(PremisesShowPage, premises)
    showPage.clickPremisesEditLink()
  })
})

Given('I edit the premises details', () => {
  cy.get('@premises').then(premises => {
    const page = PremisesEditPage.verifyOnPage(PremisesEditPage, premises)

    page.getLocalAuthorityAreaIdByLabel('North Lanarkshire', 'localAuthorityAreaId')

    page.getCharacteristicIdByLabel('Park nearby', 'parkNearbyCharacteristicId')
    page.getCharacteristicIdByLabel('Floor level access', 'floorLevelAccessCharacteristicId')

    cy.then(function _() {
      const { localAuthorityAreaId } = this
      const { parkNearbyCharacteristicId } = this
      const { floorLevelAccessCharacteristicId } = this

      const updatePremises = updatePremisesFactory.build({
        localAuthorityAreaId,
        characteristicIds: [parkNearbyCharacteristicId, floorLevelAccessCharacteristicId],
      })

      const updatedPremises = premisesFactory.build({
        ...premises,
        ...updatePremises,
        localAuthorityArea: localAuthorityFactory.build({
          name: 'North Lanarkshire',
          id: localAuthorityAreaId,
        }),
        characteristics: [
          characteristicFactory.build({
            name: 'Park nearby',
            id: parkNearbyCharacteristicId,
          }),
          characteristicFactory.build({
            name: 'Floor level access',
            id: floorLevelAccessCharacteristicId,
          }),
        ],
      })

      cy.wrap(updatedPremises).as('premises')
      page.completeForm(updatePremises)
    })
  })
})

Given('I attempt to edit the premise to remove required details', () => {
  cy.get('@premises').then(premises => {
    const page = PremisesEditPage.verifyOnPage(PremisesEditPage, premises)

    page.clearForm()
    page.clickSubmit()
  })
})

Then('I should see a confirmation for my new premises', () => {
  cy.get('@premises').then(premises => {
    const page = PremisesShowPage.verifyOnPage(PremisesShowPage, premises)
    page.shouldShowBanner('Property created')

    page.shouldShowPremisesDetails()
  })
})

Then('I should see a list of the problems encountered creating the premises', () => {
  const page = PremisesNewPage.verifyOnPage(PremisesNewPage)
  page.shouldShowErrorMessagesForFields(['name', 'addressLine1', 'postcode', 'localAuthorityAreaId'])
})

Then('I should see a confirmation for my updated premises', () => {
  cy.get('@premises').then(premises => {
    const page = PremisesShowPage.verifyOnPage(PremisesShowPage, premises)
    page.shouldShowBanner('Property updated')

    page.shouldShowPremisesDetails()
  })
})

Then('I should see a list of the problems encountered updating the premises', () => {
  cy.get('@premises').then(premises => {
    const page = PremisesEditPage.verifyOnPage(PremisesEditPage, premises)
    page.shouldShowErrorMessagesForFields(['addressLine1', 'postcode', 'localAuthorityAreaId'])
  })
})
