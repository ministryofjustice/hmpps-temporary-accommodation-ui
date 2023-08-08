import AssessmentConfirmPage from '../../../../cypress_shared/pages/assess/confirm'
import ListPage from '../../../../cypress_shared/pages/assess/list'
import AssessmentShowPage from '../../../../cypress_shared/pages/assess/show'
import Page from '../../../../cypress_shared/pages/page'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import { setupTestUser } from '../../../../cypress_shared/utils/setupTestUser'
import { assessmentFactory, assessmentSummaryFactory } from '../../../../server/testutils/factories'

context('Apply', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser('assessor')
  })

  beforeEach(() => {
    // Given I am logged in
    cy.signIn()
  })

  describe('Assess', () => {
    describe('List assessments', () => {
      it('I can view a list of assessments', () => {
        // Given there are assessments in the database
        const inProgressAssessmentSummaries = assessmentSummaryFactory.buildList(2, { status: 'in_review' })
        const unallocatedAssessmentSummaries = assessmentSummaryFactory.buildList(2, { status: 'unallocated' })
        const readyToPlaceAssessmentSummaries = assessmentSummaryFactory.buildList(2, { status: 'ready_to_place' })
        const rejectedAssessmentSummaries = assessmentSummaryFactory.buildList(2, { status: 'rejected' })
        const closedAssessmentSummaries = assessmentSummaryFactory.buildList(2, { status: 'closed' })

        cy.task('stubAssessments', [
          ...inProgressAssessmentSummaries,
          ...unallocatedAssessmentSummaries,
          ...readyToPlaceAssessmentSummaries,
          ...rejectedAssessmentSummaries,
          ...closedAssessmentSummaries,
        ])

        // When I visit the dashboard
        const dashboardPage = DashboardPage.visit()

        // And I click on the "Review and assess referrals" link
        dashboardPage.clickReviewAndAssessReferrals()

        // Then I should see the list of referrals
        const listPage = Page.verifyOnPage(
          ListPage,
          unallocatedAssessmentSummaries,
          inProgressAssessmentSummaries,
          readyToPlaceAssessmentSummaries,
          [...rejectedAssessmentSummaries, ...closedAssessmentSummaries],
        )

        // And I should see the list of referrals
        listPage.shouldShowUnallocatedAssessments()
        listPage.shouldShowInProgressAssessments()
        listPage.shouldShowReadyToPlaceAssessments()

        // Given I click on the 'View archived assessments' link
        listPage.clickViewArchivedReferrals()

        // Then I should see the list of archived assessments
        listPage.shouldShowArchivedAssessments()
      })
    })

    describe('Show an assessment', () => {
      it('I can change the state of an assessment', () => {
        cy.fixture('applicationTranslatedDocument.json').then(applicationTranslatedDocument => {
          const assessment = assessmentFactory.build({ status: 'unallocated' })
          assessment.application.document = applicationTranslatedDocument
          const assessmentSummary = assessmentSummaryFactory.buildList(1, {
            status: 'unallocated',
            person: assessment.application.person,
            id: assessment.id,
          })

          cy.task('stubAssessments', assessmentSummary)
          cy.task('stubFindAssessment', assessment)

          // Given I visit the referral list page
          const dashboardPage = DashboardPage.visit()
          dashboardPage.clickReviewAndAssessReferrals()
          const listPage = Page.verifyOnPage(ListPage, assessmentSummary, [], [], [])

          // When I click on the referral
          listPage.clickAssessment(assessment)

          // Then I should be taken to the referral show page
          const assessmentPage = Page.verifyOnPage(
            AssessmentShowPage,
            assessment.application.person.name,
            assessment.status,
          )
          // And I can view an assessment
          assessmentPage.shouldShowAssessment(applicationTranslatedDocument)

          // Given I am on the referral page
          // When I click on the 'Update referral status to: In review' button
          assessmentPage.clickAction('In review')

          // Then I am taken to the confirmation page
          const confirmationPage = Page.verifyOnPage(AssessmentConfirmPage, 'Mark this referral as in review')

          // Given I confirm the action
          // When the action is submitted
          const updatedAssessment = { ...assessment, status: 'in_review' }
          cy.task('stubAllocateAssessment', updatedAssessment)
          cy.task('stubAcceptAssessment', updatedAssessment)
          cy.task('stubCloseAssessment', updatedAssessment)
          cy.task('stubFindAssessment', updatedAssessment)
          confirmationPage.clickSubmit()

          // I am taken to the show page and a banner is shown
          Page.verifyOnPage(AssessmentShowPage, assessment.application.person.name, 'in_review')
          assessmentPage.shouldShowBanner('Assessment updated status updated to "in review"')

          // And the assessment is updated in the database
          cy.task('verifyAllocateAssessment', assessment.id).then(requests => {
            expect(requests).to.have.length(1)
          })

          // Given the assessment is in the 'in review' state
          // When I click on the Update status to 'Ready to place' button
          assessmentPage.clickAction('Ready to place')

          // Then I am taken to the confirmation page
          Page.verifyOnPage(AssessmentConfirmPage, 'Confirm this referral is ready to place')
          cy.task('stubFindAssessment', { ...updatedAssessment, status: 'ready_to_place' })

          // Given I confirm the action
          // When the action is submitted
          confirmationPage.clickSubmit()

          // I am taken to the show page and a banner is shown
          Page.verifyOnPage(AssessmentShowPage, assessment.application.person.name, 'ready_to_place')
          assessmentPage.shouldShowBanner('Assessment updated status updated to "ready to place"')

          // And the assessment is updated in the database
          cy.task('verifyAcceptAssessment', assessment.id).then(requests => {
            expect(requests).to.have.length(1)
          })

          // Given the assessment is in the 'ready to place' state
          // When I click on the Update status to 'Closed' button
          assessmentPage.clickAction('Close')

          // Then I am taken to the confirmation page
          Page.verifyOnPage(AssessmentConfirmPage, 'Archive this referral')
          cy.task('stubFindAssessment', { ...updatedAssessment, status: 'closed' })

          // Given I confirm the action
          // When the action is submitted
          confirmationPage.clickSubmit()

          // I am taken to the show page and a banner is shown
          Page.verifyOnPage(AssessmentShowPage, assessment.application.person.name, 'closed')
          assessmentPage.shouldShowBanner('Assessment updated status updated to "closed"')

          // And the assessment is updated in the database
          cy.task('verifyCloseAssessment', assessment.id).then(requests => {
            expect(requests).to.have.length(1)
          })
        })
      })
    })
  })
})
