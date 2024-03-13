import AssessmentConfirmPage from '../../../../cypress_shared/pages/assess/confirm'
import AssessmentFullPage from '../../../../cypress_shared/pages/assess/full'
import ListPage from '../../../../cypress_shared/pages/assess/list'
import AssessmentSummaryPage from '../../../../cypress_shared/pages/assess/summary'
import Page from '../../../../cypress_shared/pages/page'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import { setupTestUser } from '../../../../cypress_shared/utils/setupTestUser'
import {
  assessmentFactory,
  assessmentSummaryFactory,
  newReferralHistoryUserNoteFactory,
  referralHistoryUserNoteFactory,
} from '../../../../server/testutils/factories'
import { MockPagination } from '../../../mockApis/bookingSearch'

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
      it('shows a list of assessments', () => {
        // Given there are assessments in the database
        const inProgressAssessmentSummaries = assessmentSummaryFactory.buildList(2, { status: 'in_review' })
        const unallocatedAssessmentSummaries = assessmentSummaryFactory.buildList(2, { status: 'unallocated' })
        const readyToPlaceAssessmentSummaries = assessmentSummaryFactory.buildList(2, { status: 'ready_to_place' })
        const rejectedAssessmentSummaries = assessmentSummaryFactory.buildList(2, { status: 'rejected' })
        const closedAssessmentSummaries = assessmentSummaryFactory.buildList(2, { status: 'closed' })

        cy.task('stubAssessments', { data: unallocatedAssessmentSummaries })

        // When I visit the dashboard
        const dashboardPage = DashboardPage.visit()

        // And I click on the "Review and assess referrals" link
        dashboardPage.clickReviewAndAssessReferrals()

        // Then I should see the list of unallocated referrals
        const unallocatedListPage = Page.verifyOnPage(ListPage, 'Unallocated referrals')
        unallocatedListPage.shouldHaveActiveSubNavItem('Unallocated')
        unallocatedListPage.shouldShowAssessments(unallocatedAssessmentSummaries)

        // When I click on 'In review'
        cy.task('stubAssessments', { data: inProgressAssessmentSummaries })
        unallocatedListPage.clickSubNav('In review')

        // Then I should see the list of in review referrals
        const inReviewListPage = Page.verifyOnPage(ListPage, 'In review referrals')
        unallocatedListPage.shouldHaveActiveSubNavItem('In review')
        inReviewListPage.shouldShowAssessments(inProgressAssessmentSummaries)

        // When I click on 'Ready to place'
        cy.task('stubAssessments', { data: readyToPlaceAssessmentSummaries })
        inReviewListPage.clickSubNav('Ready to place')

        // Then I should see the list of ready to place referrals
        const readyToPlaceListPage = Page.verifyOnPage(ListPage, 'Ready to place referrals')
        unallocatedListPage.shouldHaveActiveSubNavItem('Ready to place')
        readyToPlaceListPage.shouldShowAssessments(readyToPlaceAssessmentSummaries)

        // When I click on the 'View archived assessments' link
        cy.task('stubAssessments', { data: [...closedAssessmentSummaries, ...rejectedAssessmentSummaries] })
        readyToPlaceListPage.clickViewArchivedReferrals()

        // Then I should see the list of archived assessments
        const archivedListPage = Page.verifyOnPage(ListPage, 'Archived referrals')
        archivedListPage.shouldShowAssessments([...rejectedAssessmentSummaries, ...closedAssessmentSummaries], true)
      })

      it('shows pagination and ordering on unallocated referrals', () => {
        const pagination: MockPagination = {
          totalResults: 23,
          totalPages: 3,
          pageNumber: 1,
          pageSize: 10,
        }

        // Given there are assessments in the database
        const data = assessmentSummaryFactory.buildList(6, { status: 'unallocated' })
        cy.task('stubAssessments', { data, pagination })

        // When I visit the dashboard
        const dashboardPage = DashboardPage.visit()

        // And I click on the "Review and assess referrals" link
        dashboardPage.clickReviewAndAssessReferrals()

        // When I click on the 'View archived assessments' link
        const unallocatedListPage = Page.verifyOnPage(ListPage, 'Unallocated referrals')

        // Then I should see a list of assessments
        unallocatedListPage.shouldShowAssessments(data)
        unallocatedListPage.shouldShowPageNumber(1)

        // When I navigate to the second page of results
        cy.task('stubAssessments', { data, pagination: { ...pagination, pageNumber: 2 } })
        unallocatedListPage.clickPaginationLink(2)

        // Then I see the second page of results
        unallocatedListPage.shouldShowPageNumber(2)

        // When I navigate to the next page of results
        cy.task('stubAssessments', { data, pagination: { ...pagination, pageNumber: 3 } })
        unallocatedListPage.clickPaginationLink('Next')

        // Then I see the third page of results
        unallocatedListPage.shouldShowPageNumber(3)

        // When I order by Bedspace required
        cy.task('stubAssessments', { data, pagination })
        unallocatedListPage.sortColumn('Bedspace required')

        // Then I see the first page of results ordered by status ascending
        unallocatedListPage.shouldHaveURLSearchParam('sortBy=arrivedAt')
        unallocatedListPage.shouldShowPageNumber(1)
        unallocatedListPage.checkColumnOrder('Bedspace required', 'ascending')

        // When I navigate to page 3
        cy.task('stubAssessments', { data, pagination: { ...pagination, pageNumber: 3 } })
        unallocatedListPage.clickPaginationLink(3)

        // Then I see the third page of results ordered by status ascending
        unallocatedListPage.shouldHaveURLSearchParam('sortBy=arrivedAt&sortDirection=asc')
        unallocatedListPage.shouldShowPageNumber(3)
        unallocatedListPage.checkColumnOrder('Bedspace required', 'ascending')

        // When I order by Referral received
        cy.task('stubAssessments', { data, pagination })
        unallocatedListPage.sortColumn('Referral received')

        // Then I see the first page of results ordered by Referral received ascending
        unallocatedListPage.shouldHaveURLSearchParam('sortBy=createdAt')
        unallocatedListPage.shouldShowPageNumber(1)
        unallocatedListPage.checkColumnOrder('Referral received', 'ascending')

        // When I order by Referral received again
        unallocatedListPage.sortColumn('Referral received')

        // Then I see the first page of results ordered by Referral received ascending
        unallocatedListPage.shouldHaveURLSearchParam('sortBy=createdAt&sortDirection=desc')
        unallocatedListPage.shouldShowPageNumber(1)
        unallocatedListPage.checkColumnOrder('Referral received', 'descending')
      })

      it('shows pagination and ordering on archived referrals', () => {
        const pagination: MockPagination = {
          totalResults: 34,
          totalPages: 4,
          pageNumber: 1,
          pageSize: 10,
        }

        // Given there are assessments in the database
        const rejectedAssessmentSummaries = assessmentSummaryFactory.buildList(6, { status: 'rejected' })
        const closedAssessmentSummaries = assessmentSummaryFactory.buildList(4, { status: 'closed' })
        const data = [...rejectedAssessmentSummaries, ...closedAssessmentSummaries]

        cy.task('stubAssessments', { data })

        // When I visit the dashboard
        const dashboardPage = DashboardPage.visit()

        // And I click on the "Review and assess referrals" link
        dashboardPage.clickReviewAndAssessReferrals()

        // When I click on the 'View archived assessments' link
        const unallocatedListPage = Page.verifyOnPage(ListPage, 'Unallocated referrals')
        cy.task('stubAssessments', { data, pagination })
        unallocatedListPage.clickViewArchivedReferrals()

        // Then I should see the list of archived assessments
        const archivedListPage = Page.verifyOnPage(ListPage, 'Archived referrals')
        archivedListPage.shouldShowAssessments(data, true)
        archivedListPage.shouldShowPageNumber(1)

        // When I navigate to the second page of results
        cy.task('stubAssessments', { data, pagination: { ...pagination, pageNumber: 2 } })
        archivedListPage.clickPaginationLink(2)

        // Then I see the second page of results
        archivedListPage.shouldShowPageNumber(2)

        // When I navigate to the next page of results
        cy.task('stubAssessments', { data, pagination: { ...pagination, pageNumber: 3 } })
        archivedListPage.clickPaginationLink('Next')

        // Then I see the third page of results
        archivedListPage.shouldShowPageNumber(3)

        // When I order by status
        cy.task('stubAssessments', { data, pagination })
        archivedListPage.sortColumn('Status')

        // Then I see the first page of results ordered by status ascending
        archivedListPage.shouldHaveURLSearchParam('sortBy=status')
        archivedListPage.shouldShowPageNumber(1)
        archivedListPage.checkColumnOrder('Status', 'ascending')

        // When I navigate to page 3
        cy.task('stubAssessments', { data, pagination: { ...pagination, pageNumber: 3 } })
        archivedListPage.clickPaginationLink(3)

        // Then I see the third page of results ordered by status ascending
        archivedListPage.shouldHaveURLSearchParam('sortBy=status&sortDirection=asc')
        archivedListPage.shouldShowPageNumber(3)
        archivedListPage.checkColumnOrder('Status', 'ascending')

        // When I order by Referral received
        cy.task('stubAssessments', { data, pagination })
        archivedListPage.sortColumn('Referral received')

        // Then I see the first page of results ordered by Referral received ascending
        archivedListPage.shouldHaveURLSearchParam('sortBy=createdAt')
        archivedListPage.shouldShowPageNumber(1)
        archivedListPage.checkColumnOrder('Referral received', 'ascending')

        // When I order by Referral received again
        archivedListPage.sortColumn('Referral received')

        // Then I see the first page of results ordered by Referral received ascending
        archivedListPage.shouldHaveURLSearchParam('sortBy=createdAt&sortDirection=desc')
        archivedListPage.shouldShowPageNumber(1)
        archivedListPage.checkColumnOrder('Referral received', 'descending')
      })
    })

    describe('Show an assessment', () => {
      it('allows me to change the state of an assessment', () => {
        cy.fixture('applicationTranslatedDocument.json').then(applicationTranslatedDocument => {
          const assessment = assessmentFactory.build({ status: 'unallocated' })
          assessment.application.document = applicationTranslatedDocument
          const assessmentSummary = assessmentSummaryFactory.buildList(1, {
            status: 'unallocated',
            person: assessment.application.person,
            id: assessment.id,
          })

          cy.task('stubAssessments', { data: assessmentSummary })
          cy.task('stubFindAssessment', assessment)

          // Given I visit the referral list page
          const dashboardPage = DashboardPage.visit()
          dashboardPage.clickReviewAndAssessReferrals()
          const listPage = Page.verifyOnPage(ListPage, 'Unallocated referrals')

          // When I click on the referral
          listPage.clickAssessment(assessment)

          // Then I should be taken to the referral summary page
          const assessmentPage = Page.verifyOnPage(AssessmentSummaryPage, assessment)
          // And I can view an assessment summary
          assessmentPage.shouldShowAssessmentSummary(assessment)

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

          // I am taken to the summary page and a banner is shown
          Page.verifyOnPage(AssessmentSummaryPage, { ...assessment, status: 'in_review' })
          assessmentPage.shouldShowBanner('This referral is in review')

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

          // I am taken to the summary page and a banner is shown
          Page.verifyOnPage(AssessmentSummaryPage, { ...assessment, status: 'ready_to_place' })
          assessmentPage.shouldShowBanner('This referral is ready to place')

          // And the assessment is updated in the database
          cy.task('verifyAcceptAssessment', assessment.id).then(requests => {
            expect(requests).to.have.length(1)
          })

          // Given the assessment is in the 'ready to place' state
          // When I click on the Update status to 'closed' button
          assessmentPage.clickAction('Archive')

          // Then I am taken to the confirmation page
          Page.verifyOnPage(AssessmentConfirmPage, 'Archive this referral')
          cy.task('stubFindAssessment', { ...updatedAssessment, status: 'closed' })

          // Given I confirm the action
          // When the action is submitted
          confirmationPage.clickSubmit()

          // I am taken to the summary page and a banner is shown
          Page.verifyOnPage(AssessmentSummaryPage, { ...assessment, status: 'closed' })
          assessmentPage.shouldShowBanner('This referral has been archived')

          // And the assessment is updated in the database
          cy.task('verifyCloseAssessment', assessment.id).then(requests => {
            expect(requests).to.have.length(1)
          })
        })
      })

      it('shows the full assessment', () => {
        cy.fixture('applicationTranslatedDocument.json').then(applicationTranslatedDocument => {
          const assessment = assessmentFactory.build({ status: 'unallocated' })
          assessment.application.document = applicationTranslatedDocument
          const assessmentSummary = assessmentSummaryFactory.buildList(1, {
            status: 'unallocated',
            person: assessment.application.person,
            id: assessment.id,
          })

          cy.task('stubAssessments', { data: assessmentSummary })
          cy.task('stubFindAssessment', assessment)

          // Given I visit the referral list page
          const dashboardPage = DashboardPage.visit()
          dashboardPage.clickReviewAndAssessReferrals()
          const listPage = Page.verifyOnPage(ListPage, 'Unallocated referrals')

          // When I click on the referral
          listPage.clickAssessment(assessment)

          // Then I should be taken to the referral summary page
          const assessmentSummaryPage = Page.verifyOnPage(AssessmentSummaryPage, assessment)
          // And I can view an assessment summary
          assessmentSummaryPage.shouldShowAssessmentSummary(assessment)

          // And I can view the full assessment
          assessmentSummaryPage.clickFullReferral()

          const assessmentFullPage = Page.verifyOnPage(AssessmentFullPage, assessment)

          assessmentFullPage.shouldShowAssessment(applicationTranslatedDocument)
        })
      })

      it('shows existing notes', () => {
        // Given I am on the assessment summary page
        const assessment = assessmentFactory.build()
        cy.task('stubFindAssessment', assessment)

        const assessmentSummaryPage = AssessmentSummaryPage.visit(assessment)

        // I can see notes for the assessment
        assessmentSummaryPage.shouldShowNotesTimeline()
      })

      it('allows me to create a new note', () => {
        // Given I am on the assessment summary page
        const assessment = assessmentFactory.build()
        cy.task('stubFindAssessment', assessment)

        const assessmentSummaryPage = AssessmentSummaryPage.visit(assessment)

        // When I create a new notes
        const newNote = newReferralHistoryUserNoteFactory.build()

        cy.task('stubCreateAssessmentNote', assessment)
        assessmentSummaryPage.createNote(newNote.message)

        // Then the note should have been created in the API
        cy.task('verifyCreateAssessmentNote', assessment.id).then(requests => {
          expect(requests).to.have.length(1)
          const requestBody = JSON.parse(requests[0].body)
          expect(requestBody.message.replaceAll('\r\n', '\n')).contains(newNote.message)
        })

        // And I am redirected back to assessment summary page
        const postSumbmitAssessmentSummaryPage = Page.verifyOnPage(AssessmentSummaryPage, assessment)

        postSumbmitAssessmentSummaryPage.shouldShowBanner('Note saved')
      })

      it('shows an error when I attempt to create an empty note', () => {
        // Given I am on the assessment page
        const assessment = assessmentFactory.build({
          referralHistoryNotes: referralHistoryUserNoteFactory.buildList(5),
          status: 'unallocated',
        })

        cy.task('stubFindAssessment', assessment)

        const assessmentSummaryPage = AssessmentSummaryPage.visit(assessment)

        // When I attempt to create a new notes without a message
        cy.task('stubCreateAssessmentNoteErrors', { assessmentId: assessment.id, params: ['message'] })
        assessmentSummaryPage.clickSaveNote()

        // Then I am redirected back to assessment page
        const postSumbmitSummaryAssessmentPage = Page.verifyOnPage(AssessmentSummaryPage, assessment)

        // And I should see an error messags
        postSumbmitSummaryAssessmentPage.shouldShowErrorMessagesForFields(['message'])
      })
    })
  })
})
