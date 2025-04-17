import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'

import ApplyHelper from '../../../cypress_shared/helpers/apply'
import ListPage from '../../../cypress_shared/pages/apply/list'
import ApplicationFullPage from '../../../cypress_shared/pages/apply/full'
import SelectOffencePage from '../../../cypress_shared/pages/apply/selectOffence'
import SubmissionConfirmation from '../../../cypress_shared/pages/apply/submissionConfirmation'
import Page from '../../../cypress_shared/pages/page'
import { activeOffenceFactory, applicationFactory } from '../../../server/testutils/factories'
import { person } from './utils'

import applicationData from '../../../cypress_shared/fixtures/applicationData.json'
import devOffencesData from '../../../cypress_shared/fixtures/offences-dev.json'

const offences = devOffencesData.map(offenceData => activeOffenceFactory.build(offenceData))

Given('I start a new application', () => {
  const application = applicationFactory.build({
    person,
    data: applicationData,
    arrivalDate: applicationData.eligibility['accommodation-required-from-date'].accommodationRequiredFromDate,
  })

  // Align PDU to one available to the dev e2e user
  const pdu = {
    id: '3fa6a349-5f48-4c42-8d96-938bda727c35',
    name: 'Suffolk',
  }
  application.data['contact-details']['practitioner-pdu'] = pdu
  application.data['contact-details']['probation-practitioner'].pdu = pdu

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
    const id = url.match(/referrals\/(.+)/)[1]
    const application = applicationFactory.build({ ...this.application, id, offenceId: offences[0].offenceId })

    const apply = new ApplyHelper(application, person, [], 'e2e')

    apply.completeApplication()
    cy.wrap(application).as('application')
  })
})

Given('I see a confirmation of the application', () => {
  const confirmationPage = Page.verifyOnPage(SubmissionConfirmation)

  confirmationPage.linkToFeedbackSurvey()
  confirmationPage.clickBackToDashboard()
})

Then('I can see the full submitted application', () => {
  cy.url().then(function _() {
    const listPage = Page.verifyOnPage(ListPage, [], [])

    listPage.clickSubmittedTab()

    listPage.shouldShowSubmittedApplication(this.application, false)

    listPage.clickSubmittedApplication(this.application)

    Page.verifyOnPage(ApplicationFullPage, this.application)
  })
})
