import path from 'path'
import Page from '../../../../cypress_shared/pages/page'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import BookingReportNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingReportNew'
import setupTestUser from '../../../../cypress_shared/utils/setupTestUser'
import { premisesSummaryFactory } from '../../../../server/testutils/factories'
import { bookingReportForProbationRegionFilename } from '../../../../server/utils/reportUtils'

context('Report', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser()
  })

  it('should navigate to the booking report page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is reference data in the database
    cy.task('stubBookingReportReferenceData')

    // When I visit the dashboard page
    const page = DashboardPage.visit()

    // Add I click the reports link
    cy.task('stubBookingReportReferenceData')
    page.clickReportsLink()

    // Then I navigate to the booking report page
    Page.verifyOnPage(BookingReportNewPage)
  })

  it('does not download a file when the API returns an error', () => {
    // Given I am signed in
    cy.signIn()

    // When I visit the booking report page
    cy.task('stubBookingReportReferenceData')
    const page = BookingReportNewPage.visit()

    // And I fill out the form
    cy.then(function _() {
      const probationRegion = this.actingUserProbationRegion
      const month = '3'
      const year = '2023'

      page.completeForm(month, year)

      cy.task('stubBookingReportError', {
        data: 'some-data',
        probationRegionId: probationRegion.id,
        month,
        year,
      })
    })

    page.expectDownload()
    page.clickSubmit()

    cy.get('h1').contains('Internal Server Error')
  })

  it("allows me to download a booking report for the acting user's region", () => {
    // Given I am signed in
    cy.signIn()

    // When I visit the booking report page
    cy.task('stubBookingReportReferenceData')
    const page = BookingReportNewPage.visit()

    cy.then(function _() {
      // Then I should see the user's probation region preselected
      page.shouldPreselectProbationRegion(this.actingUserProbationRegion)

      // And when I fill out the form
      const probationRegion = this.actingUserProbationRegion
      const month = '3'
      const year = '2023'

      page.completeForm(month, year)

      cy.task('stubBookingReportForRegion', { data: 'some-data', probationRegionId: probationRegion.id, month, year })
      page.expectDownload()
      page.clickSubmit()

      // Then a report should have been requested from the API
      cy.task('verifyBookingReportForRegion', { probationRegionId: probationRegion.id, month, year }).then(requests => {
        expect(requests).to.have.length(1)
      })

      // And the report should be downloded
      const filePath = path.join(
        Cypress.config('downloadsFolder'),
        bookingReportForProbationRegionFilename(probationRegion, month, year),
      )

      cy.readFile(filePath).then(file => {
        expect(file).equals('some-data')
      })
    })
  })

  it('should show an error when the user does not select required fields', () => {
    // Given I am signed in
    cy.signIn()

    // When I visit the booking report page
    cy.task('stubBookingReportReferenceData')
    const page = BookingReportNewPage.visit()

    // And I clear the probation region
    page.clearForm()
    page.clickSubmit()

    // Then I should see an messages relating to the probation region
    page.shouldShowErrorMessagesForFields(['probationRegionId', 'month', 'year'])
  })

  it('navigates back from the booking report page to the dashboard page', () => {
    // Given I am signed in
    cy.signIn()

    // And there are premises in the database
    const premisesSummaries = premisesSummaryFactory.buildList(5)
    cy.task('stubPremises', premisesSummaries)

    // When I visit the show premises page
    cy.task('stubBookingReportReferenceData')
    const page = BookingReportNewPage.visit()

    // And I click the previous bread crumb
    page.clickBreadCrumbUp()

    // Then I navigate to the dashboard page
    Page.verifyOnPage(DashboardPage)
  })
})
