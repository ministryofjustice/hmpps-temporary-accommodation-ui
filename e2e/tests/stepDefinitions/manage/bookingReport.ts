import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import path from 'path'
import Page from '../../../../cypress_shared/pages/page'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import BookingReportNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingReportNew'
import referenceDataFactory from '../../../../server/testutils/factories/referenceData'
import { bookingReportFilename, bookingReportForProbationRegionFilename } from '../../../../server/utils/reportUtils'

Given("I'm downloading a booking report", () => {
  const dashboardPage = Page.verifyOnPage(DashboardPage)
  dashboardPage.clickReportsLink()
})

Given('I select to download a report for all probation regions', () => {
  const bookingReportPage = Page.verifyOnPage(BookingReportNewPage)

  bookingReportPage.expectDownload()
  bookingReportPage.clickSubmit()

  cy.wrap(bookingReportFilename()).as('filename')
})

Given('I select a probation region to download a report for', () => {
  const bookingReportPage = Page.verifyOnPage(BookingReportNewPage)

  const probationRegion = referenceDataFactory.probationRegion().build()
  bookingReportPage.expectDownload()
  bookingReportPage.completeForm(probationRegion)

  cy.wrap(bookingReportForProbationRegionFilename(probationRegion)).as('filename')
})

Then('I should download a booking report', () => {
  cy.then(function _() {
    const filePath = path.join(Cypress.config('downloadsFolder'), this.filename)

    cy.readFile(filePath, { timeout: 10000 }).should('have.length.above', 0)
  })
})
