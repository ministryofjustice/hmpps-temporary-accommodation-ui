import { setupTestUser } from '../../../../cypress_shared/utils/setupTestUser'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import { assessmentSummaryFactory } from '../../../../server/testutils/factories'
import Page from '../../../../cypress_shared/pages/page'
import ListPage from '../../../../cypress_shared/pages/assess/list'

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
  })
})
