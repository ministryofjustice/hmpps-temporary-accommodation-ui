import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'

import PlaceHelper from '../../../cypress_shared/helpers/place'
import AssessmentConfirmPage from '../../../cypress_shared/pages/assess/confirm'
import AssessmentListPage from '../../../cypress_shared/pages/assess/list'
import AssessmentSummaryPage from '../../../cypress_shared/pages/assess/summary'
import Page from '../../../cypress_shared/pages/page'
import DashboardPage from '../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import type { Assessment } from '../../../server/@types/shared/index'
import { applicationFactory, assessmentFactory, placeContextFactory } from '../../../server/testutils/factories'
import { DateFormats } from '../../../server/utils/dateUtils'
import { person } from './utils'

import applicationData from '../../../cypress_shared/fixtures/applicationData.json'

Given('I view the list of assessments', () => {
  const dashboardPage = Page.verifyOnPage(DashboardPage)
  dashboardPage.clickReviewAndAssessReferrals()

  Page.verifyOnPage(AssessmentListPage, [], [], [], [])
})

Given('I view the assessment', () => {
  const assessmentListPage = Page.verifyOnPage(AssessmentListPage, [], [], [], [])

  const application = applicationFactory.build({
    person,
    data: applicationData,
    arrivalDate: applicationData.eligibility['accommodation-required-from-date'].accommodationRequiredFromDate,
  })

  const assessment = assessmentFactory.build({
    application,
    status: 'unallocated',
    createdAt: DateFormats.dateObjToIsoDate(new Date()),
  })

  assessmentListPage.clickAssessment(assessment)
  cy.wrap(assessment).as('assessment')
})

Given('I mark the assessment as ready to place', () => {
  cy.then(function _() {
    const { assessment } = this

    const unallocatedAssesmentSummaryPage = Page.verifyOnPage(AssessmentSummaryPage, assessment)
    unallocatedAssesmentSummaryPage.clickAction('In review')

    const inReviewConfirmationPage = Page.verifyOnPage(AssessmentConfirmPage, 'Mark this referral as in review')
    inReviewConfirmationPage.clickSubmit()

    const inReviewAssessmentSummaryPage = Page.verifyOnPage(AssessmentSummaryPage, {
      ...assessment,
      status: 'in_review',
    })
    inReviewAssessmentSummaryPage.clickAction('Ready to place')

    const readyToPlaceConfirmationPage = Page.verifyOnPage(
      AssessmentConfirmPage,
      'Confirm this referral is ready to place',
    )
    readyToPlaceConfirmationPage.clickSubmit()

    Page.verifyOnPage(AssessmentSummaryPage, { ...assessment, status: 'ready_to_place' })

    cy.wrap({ ...assessment, status: 'ready_to_place' }).as('assessment')
  })
})

Then('I can place the assessment', () => {
  cy.then(function _() {
    const assessment = this.assessment as Assessment

    const placeContext = placeContextFactory.build({
      assessment,
    })

    const placeHelper = new PlaceHelper(placeContext, this.premises, this.room)
    placeHelper.completePlace()
  })
})
