import { setupTestUser } from '../../../../cypress_shared/utils/setupTestUser'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import { assessmentFactory, assessmentSummaryFactory } from '../../../../server/testutils/factories'
import Page from '../../../../cypress_shared/pages/page'
import ListPage from '../../../../cypress_shared/pages/assess/list'
import AssessmentShowPage from '../../../../cypress_shared/pages/assess/show'

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
        const assessment = assessmentFactory.build({ status: 'unallocated' })
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
        Page.verifyOnPage(AssessmentShowPage, assessment.application.person.name, assessment.status)
      })
    })
  })
})
