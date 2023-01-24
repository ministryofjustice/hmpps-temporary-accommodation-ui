import path from 'path'
import premisesFactory from '../../../../server/testutils/factories/premises'
import { bookingReportForProbationRegionFilename } from '../../../../server/utils/reportUtils'
import Page from '../../../../cypress_shared/pages/page'
import BookingReportNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingReportNew'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import stubActingUser from '../../../../cypress_shared/utils/stubActingUser'

context('Report', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    stubActingUser()
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
      cy.task('stubBookingReportError', { data: 'some-data', probationRegionId: probationRegion.id })
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

      cy.task('stubBookingReportForRegion', { data: 'some-data', probationRegionId: probationRegion.id })
      page.expectDownload()
      page.completeForm(probationRegion)

      // Then a report should have been requested from the API
      cy.task('verifyBookingReportForRegion', probationRegion.id).then(requests => {
        expect(requests).to.have.length(1)
      })

      // And the report should be downloded
      const filePath = path.join(
        Cypress.config('downloadsFolder'),
        bookingReportForProbationRegionFilename(probationRegion),
      )

      cy.readFile(filePath).then(file => {
        expect(file).equals('some-data')
      })
    })
  })

  it('navigates back from the booking report page to the dashboard page', () => {
    // Given I am signed in
    cy.signIn()

    // And there are premises in the database
    const premises = premisesFactory.buildList(5)
    cy.task('stubPremises', premises)

    // When I visit the show premises page
    cy.task('stubBookingReportReferenceData')
    const page = BookingReportNewPage.visit()

    // And I click the previous bread crumb
    page.clickBreadCrumbUp()

    // Then I navigate to the dashboard page
    Page.verifyOnPage(DashboardPage)
  })
})
