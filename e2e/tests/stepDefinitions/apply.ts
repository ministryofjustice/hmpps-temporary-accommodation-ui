import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'

import ApplyHelper from '../../../cypress_shared/helpers/apply'
import ListPage from '../../../cypress_shared/pages/apply/list'
import SelectOffencePage from '../../../cypress_shared/pages/apply/selectOffence'
import SubmissionConfirmation from '../../../cypress_shared/pages/apply/submissionConfirmation'
import Page from '../../../cypress_shared/pages/page'
import { activeOffenceFactory, applicationFactory, personFactory } from '../../../server/testutils/factories'
import { throwMissingCypressEnvError } from './utils'

import applicationData from '../../../cypress_shared/fixtures/applicationData.json'
import devOffencesData from '../../../cypress_shared/fixtures/offences-dev.json'
import localOffencesData from '../../../cypress_shared/fixtures/offences-local.json'
import devPersonData from '../../../cypress_shared/fixtures/person-dev.json'
import localPersonData from '../../../cypress_shared/fixtures/person-local.json'

const environment = Cypress.env('environment') || throwMissingCypressEnvError('environment')

const person = personFactory.build(environment === 'local' ? localPersonData : devPersonData)
const offences = (environment === 'local' ? localOffencesData : devOffencesData).map(offenceData =>
  activeOffenceFactory.build(offenceData),
)

Given('I start a new application', () => {
  const application = applicationFactory.build({ person, data: applicationData })

  const apply = new ApplyHelper(application, person, [], 'e2e')
  apply.startApplication()

  if (offences.length > 1) {
    const selectOffencePage = Page.verifyOnPage(SelectOffencePage, person, offences)
    selectOffencePage.shouldDisplayOffences()

    selectOffencePage.selectOffence(offences[0])
    selectOffencePage.clickSubmit()
  }

  cy.wrap(application).as('application')
})

Given('I fill in and complete an application', () => {
  cy.url().then(function _(url) {
    const id = url.match(/applications\/(.+)\/tasks/)[1]
    const application = applicationFactory.build({ ...this.application, id })

    const apply = new ApplyHelper(application, person, [], 'e2e')

    apply.completeApplication()
    cy.wrap(application).as('application')
  })
})

Then('I should see a confirmation of the application', () => {
  const confirmationPage = Page.verifyOnPage(SubmissionConfirmation)

  confirmationPage.clickBackToDashboard()

  cy.then(function _() {
    const listPage = Page.verifyOnPage(ListPage, [this.application], [], [])
    listPage.shouldShowSubmittedApplications()
  })
})
