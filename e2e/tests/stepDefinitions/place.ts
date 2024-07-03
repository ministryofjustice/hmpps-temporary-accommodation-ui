import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor'

import type { Assessment, TemporaryAccommodationAssessmentStatus as AssessmentStatus } from '@approved-premises/api'
import PlaceHelper from '../../../cypress_shared/helpers/place'
import AssessmentConfirmPage from '../../../cypress_shared/pages/assess/confirm'
import AssessmentListPage from '../../../cypress_shared/pages/assess/list'
import AssessmentSummaryPage from '../../../cypress_shared/pages/assess/summary'
import Page from '../../../cypress_shared/pages/page'
import DashboardPage from '../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import AssessmentRejectionConfirmPage from '../../../cypress_shared/pages/assess/confirmRejection'
import { applicationFactory, assessmentFactory, placeContextFactory } from '../../../server/testutils/factories'
import { DateFormats } from '../../../server/utils/dateUtils'
import { person } from './utils'

import applicationData from '../../../cypress_shared/fixtures/applicationData.json'

const getAssessment = (status: AssessmentStatus) => {
  const application = applicationFactory.build({
    person,
    data: applicationData,
  })

  const assessment = assessmentFactory.build({
    application,
    status,
    createdAt: DateFormats.dateObjToIsoDate(new Date()),
    accommodationRequiredFromDate:
      applicationData.eligibility['accommodation-required-from-date'].accommodationRequiredFromDate,
  })

  cy.wrap(assessment).as('assessment')

  return assessment
}

Given('I view the list of assessments', () => {
  const dashboardPage = Page.verifyOnPage(DashboardPage)
  dashboardPage.clickReviewAndAssessReferrals()

  Page.verifyOnPage(AssessmentListPage, 'Unallocated referrals')
})

Given('I view the assessment', () => {
  const assessmentListPage = Page.verifyOnPage(AssessmentListPage, 'Unallocated referrals')
  const assessment = getAssessment('unallocated')

  assessmentListPage.clickAssessment(assessment)
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

Given('I view the list of ready to place assessments', () => {
  AssessmentListPage.visit('ready_to_place')
  Page.verifyOnPage(AssessmentListPage, 'Ready to place referrals')
})

Given('I view the ready to place assessment', () => {
  const assessmentListPage = Page.verifyOnPage(AssessmentListPage, 'Ready to place referrals')
  const assessment = getAssessment('ready_to_place')

  assessmentListPage.clickAssessment(assessment)
})

When('I reject the assessment with the reason other', () => {
  cy.then(function _() {
    const { assessment } = this

    const assessmentSummaryPage = Page.verifyOnPage(AssessmentSummaryPage, assessment)
    assessmentSummaryPage.clickAction('Reject')

    const assessmentRejectionConfirmPage = Page.verifyOnPage(AssessmentRejectionConfirmPage, assessment)
    assessmentRejectionConfirmPage.completeForm()
    assessmentRejectionConfirmPage.clickSubmit()
  })
})

Then('I see the assessment has been rejected', () => {
  cy.then(function _() {
    const { assessment } = this

    const assessmentSummaryPage = Page.verifyOnPage(AssessmentSummaryPage, { ...assessment, status: 'rejected' })
    assessmentSummaryPage.shouldShowBanner('This referral has been rejected')
  })
})

Then('I see the rejection reason in the referral notes', () => {
  cy.then(function _() {
    const { assessment } = this

    const assessmentSummaryPage = Page.verifyOnPage(AssessmentSummaryPage, { ...assessment, status: 'rejected' })
    assessmentSummaryPage.shouldShowNote('Referral marked as rejected', [
      'Rejection reason: Details about the rejection reason',
      'Withdrawal requested by the probation practitioner: Yes',
    ])
  })
})
