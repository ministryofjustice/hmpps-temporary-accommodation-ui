import { TemporaryAccommodationAssessmentSummary } from '@approved-premises/api'
import { AssessmentSearchApiStatus, AssessmentUpdatableDateField } from '@approved-premises/ui'
import { sentence } from 'case'
import { addDays } from 'date-fns'
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
  timelineEventsFactory,
} from '../../../../server/testutils/factories'
import { MockPagination } from '../../../mockApis/bookingSearch'
import AssessmentRejectionConfirmPage from '../../../../cypress_shared/pages/assess/confirmRejection'
import ChangeDatePage from '../../../../cypress_shared/pages/assess/changeDate'
import { DateFormats } from '../../../../server/utils/dateUtils'

const pagination: MockPagination = {
  totalResults: 23,
  totalPages: 3,
  pageNumber: 1,
  pageSize: 10,
}

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

      const statuses: AssessmentSearchApiStatus[] = ['unallocated', 'in_review', 'ready_to_place', 'archived']

      statuses.forEach(status => {
        const factoryStatus = status === 'archived' ? 'closed' : status
        const uiStatus = status.replace(/_/g, ' ')
        const pageTitle = sentence(`${uiStatus} referrals`)

        describe(`when viewing ${uiStatus} referrals`, () => {
          it('shows the result of a CRN or Name search and clears the search', () => {
            // Given there are assessments in the database
            const assessments = assessmentSummaryFactory.buildList(6, { status: factoryStatus })
            const searchedForReferral = assessments[1]
            const searchCrnOrName = searchedForReferral.person.crn
            cy.task('stubAssessments', { data: assessments, pagination })

            // When I visit the Archived referrals page
            const page = ListPage.visit(status)

            // Then the search by CRN or Name form is empty
            page.checkCrnOrNameSearchValue('', uiStatus)

            // And I see all the results
            page.checkResults(assessments)

            // When I submit a search by CRN or Name
            cy.task('stubAssessments', { data: [searchedForReferral] })
            page.searchByCrnOrName(searchCrnOrName, uiStatus)
            Page.verifyOnPage(ListPage, pageTitle)

            // Then the search by CRN or Name form is populated
            page.checkCrnOrNameSearchValue(searchCrnOrName, uiStatus)

            // Then I see the search result for that CRN or Name
            page.checkResults([searchedForReferral])

            // When I clear the search
            cy.task('stubAssessments', { data: assessments, pagination })
            page.clearSearch()

            // Then I see the list page
            Page.verifyOnPage(ListPage, pageTitle)

            // Then the search by CRN or Name form is populated
            page.checkCrnOrNameSearchValue('', uiStatus)

            // Then I see the search result for that CRN or Name
            page.checkResults(assessments)
          })

          it('shows a message if there are no CRN or Name search results', () => {
            const assessments = assessmentSummaryFactory.buildList(9, { status: factoryStatus })
            const noAssessments: TemporaryAccommodationAssessmentSummary[] = []
            const searchCrnOrName = 'N0M4TCH'

            cy.task('stubAssessments', { data: assessments })

            // When I visit the Archived referrals page
            const page = ListPage.visit(status)

            // Then the search by CRN or Name form is empty
            page.checkCrnOrNameSearchValue('', uiStatus)

            // And I see all the results
            page.checkResults(assessments)

            // When I submit a search by CRN or Name
            cy.task('stubAssessments', { data: noAssessments })
            page.searchByCrnOrName(searchCrnOrName, uiStatus)
            Page.verifyOnPage(ListPage, pageTitle)

            // Then the search by CRN or Name form is populated
            page.checkCrnOrNameSearchValue(searchCrnOrName, uiStatus)

            // Then I see no search results for that CRN
            page.checkResults(noAssessments)

            // And I see a message
            page.checkNoResultsByCRN(uiStatus, 'N0M4TCH')
          })

          it('shows pagination and ordering', () => {
            // Given there are assessments in the database
            const data = assessmentSummaryFactory.buildList(6, { status: factoryStatus })
            cy.task('stubAssessments', { data, pagination })

            // When I visit the referrals page
            const page = ListPage.visit(status)

            // Then I should see a list of assessments
            page.shouldShowAssessments(data)
            page.shouldShowPageNumber(1)

            // When I navigate to the second page of results
            cy.task('stubAssessments', { data, pagination: { ...pagination, pageNumber: 2 } })
            page.clickPaginationLink(2)

            // Then I see the second page of results
            page.shouldShowPageNumber(2)

            // When I navigate to the next page of results
            cy.task('stubAssessments', { data, pagination: { ...pagination, pageNumber: 3 } })
            page.clickPaginationLink('Next')

            // Then I see the third page of results
            page.shouldShowPageNumber(3)

            // When I order by Referral received
            cy.task('stubAssessments', { data, pagination })
            page.sortColumn('Referral received')

            // Then I see the first page of results ordered by Referral received ascending
            page.shouldHaveURLSearchParam('sortBy=createdAt')
            page.shouldShowPageNumber(1)
            page.checkColumnOrder('Referral received', 'ascending')

            // When I navigate to page 3
            cy.task('stubAssessments', { data, pagination: { ...pagination, pageNumber: 3 } })
            page.clickPaginationLink(3)

            // Then I see the third page of results ordered by Referral received ascending
            page.shouldHaveURLSearchParam('sortBy=createdAt&sortDirection=asc')
            page.shouldShowPageNumber(3)
            page.checkColumnOrder('Referral received', 'ascending')

            // When I order by Bedspace required
            cy.task('stubAssessments', { data, pagination })
            page.sortColumn('Bedspace required')

            // Then I see the first page of results ordered by Bedspace required ascending
            page.shouldHaveURLSearchParam('sortBy=arrivedAt')
            page.shouldShowPageNumber(1)
            page.checkColumnOrder('Bedspace required', 'ascending')

            // When I order by Bedspace required again
            page.sortColumn('Bedspace required')

            // Then I see the first page of results ordered by Bedspace required descending
            page.shouldHaveURLSearchParam('sortBy=arrivedAt&sortDirection=desc')
            page.shouldShowPageNumber(1)
            page.checkColumnOrder('Bedspace required', 'descending')
          })
        })
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

          const timeline = timelineEventsFactory.build()

          cy.task('stubAssessments', { data: assessmentSummary })
          cy.task('stubFindAssessment', assessment)
          cy.task('stubAssessmentReferralHistoryGet', {
            assessment,
            referralNotes: timeline.events,
          })

          // Given I visit the referral list page
          const dashboardPage = DashboardPage.visit()
          dashboardPage.clickReviewAndAssessReferrals()
          const listPage = Page.verifyOnPage(ListPage, 'Unallocated referrals')

          // When I click on the referral
          listPage.clickAssessment(assessment)

          // Then I should be taken to the referral summary page
          const assessmentPage = Page.verifyOnPage(AssessmentSummaryPage, assessment, timeline)
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
          Page.verifyOnPage(AssessmentSummaryPage, { ...assessment, status: 'in_review' }, timeline)
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
          Page.verifyOnPage(AssessmentSummaryPage, { ...assessment, status: 'ready_to_place' }, timeline)
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
          Page.verifyOnPage(AssessmentSummaryPage, { ...assessment, status: 'closed' }, timeline)
          assessmentPage.shouldShowBanner('This referral has been archived')

          // And the assessment is updated in the database
          cy.task('verifyCloseAssessment', assessment.id).then(requests => {
            expect(requests).to.have.length(1)
          })
        })
      })

      it('allows rejecting an assessment', () => {
        cy.fixture('applicationTranslatedDocument.json').then(applicationTranslatedDocument => {
          const assessment = assessmentFactory.build({ status: 'unallocated' })
          const timeline = timelineEventsFactory.build()

          assessment.application.document = applicationTranslatedDocument

          cy.task('stubFindAssessment', assessment)
          cy.task('stubAssessmentReferralHistoryGet', {
            assessment,
            referralNotes: timeline.events,
          })

          cy.task('stubReferralRejectionReasons')

          // Given I visit the assessment page
          const assessmentPage = AssessmentSummaryPage.visit(assessment, timeline)

          // When I click on the Update status to 'Reject' button
          assessmentPage.clickAction('Reject')

          // Then I am taken to the confirmation page
          const rejectionConfirmationPage = Page.verifyOnPage(AssessmentRejectionConfirmPage, assessment)

          cy.task('stubRejectAssessment', assessment)
          cy.task('stubFindAssessment', { ...assessment, status: 'rejected' })

          // When I complete the form
          rejectionConfirmationPage.completeForm()
          rejectionConfirmationPage.clickSubmit()

          // Then I am taken to the summary page and a banner is shown
          Page.verifyOnPage(AssessmentSummaryPage, { ...assessment, status: 'rejected' }, timeline)
          assessmentPage.shouldShowBanner('This referral has been rejected')
        })
      })

      it('shows errors when rejecting an assessment', () => {
        cy.fixture('applicationTranslatedDocument.json').then(applicationTranslatedDocument => {
          const assessment = assessmentFactory.build({ status: 'unallocated' })
          const timeline = timelineEventsFactory.build()

          assessment.application.document = applicationTranslatedDocument

          cy.task('stubFindAssessment', assessment)
          cy.task('stubAssessmentReferralHistoryGet', {
            assessment,
            referralNotes: timeline.events,
          })

          cy.task('stubReferralRejectionReasons')

          // Given I visit the assessment page
          const assessmentPage = AssessmentSummaryPage.visit(assessment, timeline)

          // When I click on the Update status to 'Reject' button
          assessmentPage.clickAction('Reject')

          // Then I am taken to the confirmation page
          let rejectionConfirmationPage = Page.verifyOnPage(AssessmentRejectionConfirmPage, assessment)

          cy.task('stubRejectAssessment', assessment)
          cy.task('stubFindAssessment', { ...assessment, status: 'rejected' })

          // When I submit the form empty
          rejectionConfirmationPage.clickSubmit()

          // Then I see errors
          rejectionConfirmationPage = Page.verifyOnPage(AssessmentRejectionConfirmPage, assessment)
          rejectionConfirmationPage.shouldShowErrorMessagesForFields([
            'referralRejectionReasonId',
            'ppRequestedWithdrawal',
          ])

          // When I complete the form but clear the details
          rejectionConfirmationPage.completeForm()
          rejectionConfirmationPage.clearRejectionReasonDetail()
          rejectionConfirmationPage.clickSubmit()

          // Then I see one error
          rejectionConfirmationPage = Page.verifyOnPage(AssessmentRejectionConfirmPage, assessment)
          rejectionConfirmationPage.shouldShowErrorMessagesForFields(['referralRejectionReasonDetail'])
        })
      })

      it('shows the full assessment', () => {
        cy.fixture('applicationTranslatedDocument.json').then(applicationTranslatedDocument => {
          const assessment = assessmentFactory.build({ status: 'unallocated' })
          const timeline = timelineEventsFactory.build()

          assessment.application.document = applicationTranslatedDocument
          const assessmentSummary = assessmentSummaryFactory.buildList(1, {
            status: 'unallocated',
            person: assessment.application.person,
            id: assessment.id,
          })

          cy.task('stubAssessments', { data: assessmentSummary })
          cy.task('stubFindAssessment', assessment)
          cy.task('stubAssessmentReferralHistoryGet', {
            assessment,
            referralNotes: timeline.events,
          })

          // Given I visit the referral list page
          const dashboardPage = DashboardPage.visit()
          dashboardPage.clickReviewAndAssessReferrals()
          const listPage = Page.verifyOnPage(ListPage, 'Unallocated referrals')

          // When I click on the referral
          listPage.clickAssessment(assessment)

          // Then I should be taken to the referral summary page
          const assessmentSummaryPage = Page.verifyOnPage(AssessmentSummaryPage, assessment, timeline)

          // And I can view an assessment summary
          assessmentSummaryPage.shouldShowAssessmentSummary(assessment)

          // And I can view the full assessment
          assessmentSummaryPage.clickFullReferral()
          const assessmentFullPage = Page.verifyOnPage(AssessmentFullPage, assessment)

          const updatedResponses = {
            'Release date': DateFormats.isoDateToUIDate(assessment.releaseDate),
            'Accommodation required from date': DateFormats.isoDateToUIDate(assessment.accommodationRequiredFromDate),
          }
          assessmentFullPage.shouldShowAssessment(applicationTranslatedDocument, updatedResponses)
        })
      })

      it('allows me to create a new note', () => {
        // Given I am on the assessment summary page
        const assessment = assessmentFactory.build()
        const timeline = timelineEventsFactory.build()

        cy.task('stubFindAssessment', assessment)

        cy.task('stubAssessmentReferralHistoryGet', {
          assessment,
          referralNotes: timeline.events,
        })

        const assessmentSummaryPage = AssessmentSummaryPage.visit(assessment, timeline)

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
        const postSumbmitAssessmentSummaryPage = Page.verifyOnPage(AssessmentSummaryPage, assessment, timeline)

        postSumbmitAssessmentSummaryPage.shouldShowBanner('Note saved')
      })

      it('shows an error when I attempt to create an empty note', () => {
        // Given I am on the assessment page
        const assessment = assessmentFactory.build({
          status: 'unallocated',
        })
        const timeline = timelineEventsFactory.build()

        cy.task('stubFindAssessment', assessment)

        cy.task('stubAssessmentReferralHistoryGet', {
          assessment,
          referralNotes: timeline.events,
        })

        const assessmentSummaryPage = AssessmentSummaryPage.visit(assessment, timeline)

        // When I attempt to create a new notes without a message
        cy.task('stubCreateAssessmentNoteErrors', { assessmentId: assessment.id, params: ['message'] })
        assessmentSummaryPage.clickSaveNote()

        // Then I am redirected back to assessment page
        const postSumbmitSummaryAssessmentPage = Page.verifyOnPage(AssessmentSummaryPage, assessment, timeline)

        // And I should see an error messags
        postSumbmitSummaryAssessmentPage.shouldShowErrorMessagesForFields(['message'])
      })

      describe('editing dates', () => {
        it("allows me to edit the person's release date", () => {
          const assessment = assessmentFactory.build()
          const timeline = timelineEventsFactory.build()

          cy.task('stubFindAssessment', assessment)
          cy.task('stubUpdateAssessment', assessment)

          cy.task('stubAssessmentReferralHistoryGet', {
            assessment,
            referralNotes: timeline.events,
          })

          const existingDate = assessment.releaseDate
          const updatedDate = DateFormats.dateObjToIsoDate(addDays(DateFormats.isoToDateObj(existingDate), -2))

          // Given I visit the full assessment page
          const assessmentPage = AssessmentFullPage.visit(assessment)

          // When I click on Change next to Release date
          assessmentPage.clickChange("the person's release date")

          // Then I see the form to change the release date
          const changeReleaseDatePage = Page.verifyOnPage(ChangeDatePage, 'releaseDate', assessment)

          // And the form shows the existing date
          changeReleaseDatePage.shouldShowDateInputs('releaseDate', assessment.releaseDate)

          // When I submit a new date
          changeReleaseDatePage.completeForm(updatedDate)

          // Then I should see the full referral page with a success message
          const fullReferralPage = Page.verifyOnPage(AssessmentFullPage, assessment)

          fullReferralPage.shouldShowBanner('The referral has been updated with your changes')
        })

        it('allows me to edit the date the accommodation is required', () => {
          const assessment = assessmentFactory.build()
          const timeline = timelineEventsFactory.build()

          cy.task('stubFindAssessment', assessment)
          cy.task('stubUpdateAssessment', assessment)

          cy.task('stubAssessmentReferralHistoryGet', {
            assessment,
            referralNotes: timeline.events,
          })

          const existingDate = assessment.accommodationRequiredFromDate
          const updatedDate = DateFormats.dateObjToIsoDate(addDays(DateFormats.isoToDateObj(existingDate), 3))

          // Given I visit the full assessment page
          const assessmentPage = AssessmentFullPage.visit(assessment)

          // When I click on Change next to Accommodation required from date
          assessmentPage.clickChange('the date accommodation is required')

          // Then I see the form to change the accommodation required from date
          const changeAccommodationRequiredFromPage = Page.verifyOnPage(
            ChangeDatePage,
            'accommodationRequiredFromDate',
            assessment,
          )

          // And the form shows the existing date
          changeAccommodationRequiredFromPage.shouldShowDateInputs(
            'accommodationRequiredFromDate',
            assessment.accommodationRequiredFromDate,
          )

          // When I submit a new date
          changeAccommodationRequiredFromPage.completeForm(updatedDate)

          // Then I should see the full referral page with a success message
          const fullReferralPage = Page.verifyOnPage(AssessmentFullPage, assessment)

          fullReferralPage.shouldShowBanner('The referral has been updated with your changes')
        })

        describe('with errors', () => {
          const dateFields: AssessmentUpdatableDateField[] = ['releaseDate', 'accommodationRequiredFromDate']

          dateFields.forEach(dateField => {
            it(`shows when the ${dateField} field is empty`, () => {
              const assessment = assessmentFactory.build()
              const timeline = timelineEventsFactory.build()

              cy.task('stubFindAssessment', assessment)

              cy.task('stubAssessmentReferralHistoryGet', {
                assessment,
                referralNotes: timeline.events,
              })

              // Given I am changing the release date for a referral
              const changeDatePage = ChangeDatePage.visit(dateField, assessment)

              // When I submit the form with no date
              changeDatePage.clearDateInputs(dateField)
              changeDatePage.clickSubmit('Save and continue')

              // Then I see an error
              changeDatePage.shouldShowErrorMessagesForFields([dateField], 'empty', 'assessmentUpdate')
            })

            it(`shows when the ${dateField} field is invalid`, () => {
              const assessment = assessmentFactory.build()
              const timeline = timelineEventsFactory.build()

              cy.task('stubFindAssessment', assessment)

              cy.task('stubAssessmentReferralHistoryGet', {
                assessment,
                referralNotes: timeline.events,
              })

              // Given I am changing the release date for a referral
              const changeDatePage = ChangeDatePage.visit(dateField, assessment)

              // When I submit the form with an invalid date
              changeDatePage.completeForm('32-32-32')

              // Then I see an error
              changeDatePage.shouldShowErrorMessagesForFields([dateField], 'invalid', 'assessmentUpdate')
            })
          })

          it(`shows when the release date submitted is after the accommodation required from date`, () => {
            const assessment = assessmentFactory.build()
            const timeline = timelineEventsFactory.build()

            cy.task('stubFindAssessment', assessment)
            cy.task('stubUpdateAssessmentError', {
              assessment,
              errorBody: { detail: 'Release date cannot be after accommodation required from date: 2024-06-19' },
            })

            cy.task('stubAssessmentReferralHistoryGet', {
              assessment,
              referralNotes: timeline.events,
            })

            // Given I am changing the release date for a referral
            const changeDatePage = ChangeDatePage.visit('releaseDate', assessment)

            // When I submit the form with a date that returns an error
            changeDatePage.completeForm('2024-06-20')

            // Then I see an error
            changeDatePage.shouldShowErrorMessagesForFields(
              ['releaseDate'],
              'afterAccommodationRequiredFromDate',
              'assessmentUpdate',
            )
          })

          it(`shows when the accommodation required from date submitted is before the release date`, () => {
            const assessment = assessmentFactory.build()
            const timeline = timelineEventsFactory.build()

            cy.task('stubFindAssessment', assessment)
            cy.task('stubUpdateAssessmentError', {
              assessment,
              errorBody: { detail: 'Accommodation required from date cannot be before release date: 2024-06-19' },
            })

            cy.task('stubAssessmentReferralHistoryGet', {
              assessment,
              referralNotes: timeline.events,
            })

            // Given I am changing the release date for a referral
            const changeDatePage = ChangeDatePage.visit('accommodationRequiredFromDate', assessment)

            // When I submit the form with a date that returns an error
            changeDatePage.completeForm('2024-06-18')

            // Then I see an error
            // changeDatePage.shouldShowCustomSummaryError('Enter a date which is ')
            changeDatePage.shouldShowErrorMessagesForFields(
              ['accommodationRequiredFromDate'],
              'beforeReleaseDate',
              'assessmentUpdate',
            )
          })
        })
      })
    })
  })
})
