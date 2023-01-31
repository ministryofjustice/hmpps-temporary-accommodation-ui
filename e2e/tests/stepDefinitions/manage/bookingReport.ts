import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import path from 'path'
import Page from '../../../../cypress_shared/pages/page'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import BookingReportNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingReportNew'
import probationRegionFactory from '../../../../server/testutils/factories/probationRegion'
import { bookingReportForProbationRegionFilename } from '../../../../server/utils/reportUtils'
import { getUrlEncodedCypressEnv, throwMissingCypressEnvError } from '../utils'

const actingUserProbationRegionId =
  Cypress.env('acting_user_probation_region_id') || throwMissingCypressEnvError('acting_user_probation_region_id')
const actingUserProbationRegionName =
  getUrlEncodedCypressEnv('acting_user_probation_region_name') ||
  throwMissingCypressEnvError('acting_user_probation_region_name')

Given("I'm downloading a booking report", () => {
  const dashboardPage = Page.verifyOnPage(DashboardPage)

  dashboardPage.clickReportsLink()
})

Given('I download a report for the preselected probation region', () => {
  const bookingReportPage = Page.verifyOnPage(BookingReportNewPage)

  const probationRegion = probationRegionFactory.build({
    id: actingUserProbationRegionId,
    name: actingUserProbationRegionName,
  })

  bookingReportPage.shouldPreselectProbationRegion(probationRegion)
  bookingReportPage.expectDownload(10000)
  bookingReportPage.clickSubmit()

  cy.wrap(bookingReportForProbationRegionFilename(probationRegion)).as('filename')
})

Given('I clear the preselected probation region and attempt to download a report', () => {
  const bookingReportPage = Page.verifyOnPage(BookingReportNewPage)

  bookingReportPage.clearForm()
  bookingReportPage.clickSubmit()

  cy.wrap(['probationRegionId']).as('missing')
})

Then('I should download a booking report', () => {
  cy.then(function _() {
    const filePath = path.join(Cypress.config('downloadsFolder'), this.filename)

    cy.readFile(filePath).should('have.length.above', 0)
  })
})

Then('I should see a list of the problems encountered downloading the report', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(BookingReportNewPage)
    page.shouldShowErrorMessagesForFields(this.missing)
  })
})
