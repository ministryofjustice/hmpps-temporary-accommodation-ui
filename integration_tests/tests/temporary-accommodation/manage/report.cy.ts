import path from 'path'
import { Cas3ReportType } from '@approved-premises/api'
import Page from '../../../../cypress_shared/pages/page'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import ReportNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/reportNew'
import { setupTestUser } from '../../../../cypress_shared/utils/setupTestUser'
import { premisesSummaryFactory } from '../../../../server/testutils/factories'
import { reportForProbationRegionFilename } from '../../../../server/utils/reportUtils'
import { DateFormats } from '../../../../server/utils/dateUtils'

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
    const type: Cas3ReportType = 'booking'
    cy.then(function _() {
      const probationRegion = this.actingUserProbationRegion
      const startDate = '12/01/2024'
      const endDate = '12/03/2024'

      page.completeForm(startDate, endDate)

      cy.task('stubReportError', {
        data: 'some-data',
        probationRegionId: probationRegion.id,
        startDate: DateFormats.datepickerInputToIsoString(startDate),
        endDate: DateFormats.datepickerInputToIsoString(endDate),
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
      const type = 'booking'
      const probationRegion = this.actingUserProbationRegion
      const startDate = '01/02/2024'
      const startDateIso = DateFormats.datepickerInputToIsoString(startDate)
      const endDate = '01/03/2024'
      const endDateIso = DateFormats.datepickerInputToIsoString(endDate)

      page.completeForm(startDate, endDate)

      cy.task('stubReportForRegion', {
        data: 'some-data',
        probationRegionId: probationRegion.id,
        startDate: startDateIso,
        endDate: endDateIso,
        type,
      })
      page.expectDownload()
      page.clickDownload(type)

      // Then a report should have been requested from the API
      cy.task('verifyReportForRegion', {
        probationRegionId: probationRegion.id,
        startDate: startDateIso,
        endDate: endDateIso,
        type,
      }).then(requests => {
        expect(requests).to.have.length(1)
      })

      // And the report should be downloaded
      const filePath = path.join(
        Cypress.config('downloadsFolder'),
        reportForProbationRegionFilename(probationRegion.name, startDateIso, endDateIso, type),
      )

      cy.readFile(filePath)
      // .then(file => {
      //   expect(file).equals('some-data')
      // })
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
      const type = 'bedOccupancy'
      const probationRegion = this.actingUserProbationRegion
      const startDate = '01/02/2024'
      const startDateIso = DateFormats.datepickerInputToIsoString(startDate)
      const endDate = '01/03/2024'
      const endDateIso = DateFormats.datepickerInputToIsoString(endDate)

      page.completeForm(startDate, endDate)

      cy.task('stubReportForRegion', {
        data: 'some-data',
        probationRegionId: probationRegion.id,
        startDate: startDateIso,
        endDate: endDateIso,
        type,
      })
      page.expectDownload()
      page.clickDownload(type)

      // Then a report should have been requested from the API
      cy.task('verifyReportForRegion', {
        probationRegionId: probationRegion.id,
        startDate: startDateIso,
        endDate: endDateIso,
        type,
      }).then(requests => {
        expect(requests).to.have.length(1)
      })

      // And the report should be downloaded
      const filePath = path.join(
        Cypress.config('downloadsFolder'),
        reportForProbationRegionFilename(probationRegion.name, startDateIso, endDateIso, type),
      )

      cy.readFile(filePath)
      // .then(file => {
      //   expect(file).equals('some-data')
      // })
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
      const type = 'bedUsage'
      const probationRegion = this.actingUserProbationRegion
      const startDate = '01/02/2024'
      const startDateIso = DateFormats.datepickerInputToIsoString(startDate)
      const endDate = '01/03/2024'
      const endDateIso = DateFormats.datepickerInputToIsoString(endDate)

      page.completeForm(startDate, endDate)

      cy.task('stubReportForRegion', {
        data: 'some-data',
        probationRegionId: probationRegion.id,
        startDate: startDateIso,
        endDate: endDateIso,
        type,
      })
      page.expectDownload()
      page.clickDownload(type)

      // Then a report should have been requested from the API
      cy.task('verifyReportForRegion', {
        probationRegionId: probationRegion.id,
        startDate: startDateIso,
        endDate: endDateIso,
        type,
      }).then(requests => {
        expect(requests).to.have.length(1)
      })

      // And the report should be downloaded
      const filePath = path.join(
        Cypress.config('downloadsFolder'),
        reportForProbationRegionFilename(probationRegion.name, startDateIso, endDateIso, type),
      )

      cy.readFile(filePath)
      // .then(file => {
      //   expect(file).equals('some-data')
      // })
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
      const type = 'referral'
      const probationRegion = this.actingUserProbationRegion
      const startDate = '01/02/2024'
      const startDateIso = DateFormats.datepickerInputToIsoString(startDate)
      const endDate = '01/03/2024'
      const endDateIso = DateFormats.datepickerInputToIsoString(endDate)

      page.completeForm(startDate, endDate)

      cy.task('stubReportForRegion', {
        data: 'some-data',
        probationRegionId: probationRegion.id,
        startDate: startDateIso,
        endDate: endDateIso,
        type,
      })
      page.expectDownload()
      page.clickDownload(type)

      // Then a report should have been requested from the API
      cy.task('verifyReportForRegion', {
        probationRegionId: probationRegion.id,
        startDate: startDateIso,
        endDate: endDateIso,
        type,
      }).then(requests => {
        expect(requests).to.have.length(1)
      })

      // And the report should be downloaded
      const filePath = path.join(
        Cypress.config('downloadsFolder'),
        reportForProbationRegionFilename(probationRegion.name, startDateIso, endDateIso, type),
      )

      cy.readFile(filePath)
      // .then(file => {
      //   expect(file).equals('some-data')
      // })
    })
  })

  it('should show an error when the user does not select required fields, then clear them when they are corrected', () => {
    // Given I am signed in
    cy.signIn()

    // When I visit the report page
    cy.task('stubReportReferenceData')
    const page = ReportNewPage.visit()

    cy.then(function _() {
      // And I clear all the fields
      page.clearForm()
      page.clickDownload('bedOccupancy')

      // Then I should see error messages for all fields
      page.shouldShowErrorMessagesForFields(['probationRegionId', 'startDate', 'endDate'])

      // When I complete the form
      const type = 'referral'
      const probationRegion = this.actingUserProbationRegion
      const startDate = '01/02/2024'
      const startDateIso = DateFormats.datepickerInputToIsoString(startDate)
      const endDate = '01/03/2024'
      const endDateIso = DateFormats.datepickerInputToIsoString(endDate)

      page.completeForm(startDate, endDate, probationRegion.id)

      cy.task('stubReportForRegion', {
        data: 'some-data',
        probationRegionId: probationRegion.id,
        startDate: startDateIso,
        endDate: endDateIso,
        type,
      })
      // page.expectDownload()
      page.clickDownload(type)

      // Then I should no longer see any error
      page.shouldNotShowErrors()
    })
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
