import path from 'path'
import Page from '../../../../cypress_shared/pages/page'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import ReportNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/reportNew'
import { setupTestUser } from '../../../../cypress_shared/utils/setupTestUser'
import { premisesSummaryFactory } from '../../../../server/testutils/factories'
import { reportForProbationRegionFilename } from '../../../../server/utils/reportUtils'

context('Report', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser('assessor')
  })

  it('should navigate to the report page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is reference data in the database
    cy.task('stubReportReferenceData')

    // When I visit the dashboard page
    const page = DashboardPage.visit()

    // Add I click the reports link
    cy.task('stubReportReferenceData')
    page.clickReportsLink()

    // Then I navigate to the report page
    Page.verifyOnPage(ReportNewPage)
  })

  it('does not download a file when the API returns an error', () => {
    // Given I am signed in
    cy.signIn()

    // When I visit the report page
    cy.task('stubReportReferenceData')
    const page = ReportNewPage.visit()

    // And I fill out the form
    const type = 'bookings'
    cy.then(function _() {
      const probationRegion = this.actingUserProbationRegion
      const month = '3'
      const year = '2023'

      page.completeForm(month, year)

      cy.task('stubReportError', {
        data: 'some-data',
        probationRegionId: probationRegion.id,
        month,
        year,
        type,
      })
    })

    page.expectDownload()
    page.clickDownload(type)

    // Then I should see an error message
    cy.get('h1').contains('Internal Server Error')
  })

  it("allows me to download a booking report for the acting user's region", () => {
    // Given I am signed in
    cy.signIn()

    // When I visit the report page
    cy.task('stubReportReferenceData')
    const page = ReportNewPage.visit()

    cy.then(function _() {
      // Given I need a report for my region
      page.shouldPreselectProbationRegion(this.actingUserProbationRegion)

      // When I fill out the form
      const type = 'bookings'
      const probationRegion = this.actingUserProbationRegion
      const month = '3'
      const year = '2023'

      page.completeForm(month, year)

      cy.task('stubReportForRegion', {
        data: 'some-data',
        probationRegionId: probationRegion.id,
        month,
        year,
        type,
      })
      page.expectDownload()
      page.clickDownload(type)

      // Then a report should have been requested from the API
      cy.task('verifyReportForRegion', { probationRegionId: probationRegion.id, month, year, type }).then(requests => {
        expect(requests).to.have.length(1)
      })

      // And the report should be downloaded
      const filePath = path.join(
        Cypress.config('downloadsFolder'),
        reportForProbationRegionFilename(probationRegion.name, month, year, type),
      )

      cy.readFile(filePath).then(file => {
        expect(file).equals('some-data')
      })
    })
  })

  it("allows me to download an occupancy report for the acting user's region", () => {
    // Given I am signed in
    cy.signIn()

    // When I visit the report page
    cy.task('stubReportReferenceData')
    const page = ReportNewPage.visit()

    cy.then(function _() {
      // Given I need a report for my region
      page.shouldPreselectProbationRegion(this.actingUserProbationRegion)

      // When I fill out the form
      const type = 'occupancy'
      const probationRegion = this.actingUserProbationRegion
      const month = '3'
      const year = '2023'

      page.completeForm(month, year)

      cy.task('stubReportForRegion', {
        data: 'some-data',
        probationRegionId: probationRegion.id,
        month,
        year,
        type,
      })
      page.expectDownload()
      page.clickDownload(type)

      // Then a report should have been requested from the API
      cy.task('verifyReportForRegion', { probationRegionId: probationRegion.id, month, year, type }).then(requests => {
        expect(requests).to.have.length(1)
      })

      // And the report should be downloaded
      const filePath = path.join(
        Cypress.config('downloadsFolder'),
        reportForProbationRegionFilename(probationRegion.name, month, year, type),
      )

      cy.readFile(filePath).then(file => {
        expect(file).equals('some-data')
      })
    })
  })

  it("allows me to download a bedspace usage report for the acting user's region", () => {
    // Given I am signed in
    cy.signIn()

    // When I visit the report page
    cy.task('stubReportReferenceData')
    const page = ReportNewPage.visit()

    cy.then(function _() {
      // Given I need a report for my region
      page.shouldPreselectProbationRegion(this.actingUserProbationRegion)

      // When I fill out the form
      const type = 'bedspace-usage'
      const probationRegion = this.actingUserProbationRegion
      const month = '3'
      const year = '2023'

      page.completeForm(month, year)

      cy.task('stubReportForRegion', {
        data: 'some-data',
        probationRegionId: probationRegion.id,
        month,
        year,
        type,
      })
      page.expectDownload()
      page.clickDownload(type)

      // Then a report should have been requested from the API
      cy.task('verifyReportForRegion', { probationRegionId: probationRegion.id, month, year, type }).then(requests => {
        expect(requests).to.have.length(1)
      })

      // And the report should be downloaded
      const filePath = path.join(
        Cypress.config('downloadsFolder'),
        reportForProbationRegionFilename(probationRegion.name, month, year, type),
      )

      cy.readFile(filePath).then(file => {
        expect(file).equals('some-data')
      })
    })
  })

  it("allows me to download a referrals report for the acting user's region", () => {
    // Given I am signed in
    cy.signIn()

    // When I visit the report page
    cy.task('stubReportReferenceData')
    const page = ReportNewPage.visit()

    cy.then(function _() {
      // Given I need a report for my region
      page.shouldPreselectProbationRegion(this.actingUserProbationRegion)

      // When I fill out the form
      const type = 'referrals'
      const probationRegion = this.actingUserProbationRegion
      const month = '3'
      const year = '2023'

      page.completeForm(month, year)

      cy.task('stubReportForRegion', {
        data: 'some-data',
        probationRegionId: probationRegion.id,
        month,
        year,
        type,
      })
      page.expectDownload()
      page.clickDownload(type)

      // Then a report should have been requested from the API
      cy.task('verifyReportForRegion', { probationRegionId: probationRegion.id, month, year, type }).then(requests => {
        expect(requests).to.have.length(1)
      })

      // And the report should be downloaded
      const filePath = path.join(
        Cypress.config('downloadsFolder'),
        reportForProbationRegionFilename(probationRegion.name, month, year, type),
      )

      cy.readFile(filePath).then(file => {
        expect(file).equals('some-data')
      })
    })
  })

  it('should show an error when the user does not select required fields', () => {
    // Given I am signed in
    cy.signIn()

    // When I visit the report page
    cy.task('stubReportReferenceData')
    const page = ReportNewPage.visit()

    // And I clear the probation region
    page.clearForm()
    page.clickDownload('occupancy')

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
    cy.task('stubReportReferenceData')
    const page = ReportNewPage.visit()

    // And I click the previous bread crumb
    page.clickBreadCrumbUp()

    // Then I navigate to the dashboard page
    Page.verifyOnPage(DashboardPage)
  })
})
