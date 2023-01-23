import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import path from 'path'
import Page from '../../../../cypress_shared/pages/page'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import BookingReportNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingReportNew'
import probationRegionFactory from '../../../../server/testutils/factories/probationRegion'
import { bookingReportForProbationRegionFilename } from '../../../../server/utils/reportUtils'
import throwMissingCypressEnvError from '../utils'

const actingUserProbationRegionId =
  Cypress.env('acting_user_probation_region_id') || throwMissingCypressEnvError('acting_user_probation_region_id')
const actingUserProbationRegionName =
  Cypress.env('acting_user_probation_region_name') || throwMissingCypressEnvError('acting_user_probation_region_name')

Given("I'm downloading a booking report", () => {
  const dashboardPage = Page.verifyOnPage(DashboardPage)
  dashboardPage.clickReportsLink()
})

Given('I select a probation region to download a report for', () => {
  const bookingReportPage = Page.verifyOnPage(BookingReportNewPage)

  const probationRegion = probationRegionFactory.build({
    id: actingUserProbationRegionId,
    name: actingUserProbationRegionName,
  })
  bookingReportPage.expectDownload(10000)
  bookingReportPage.completeForm(probationRegion)

  cy.wrap(bookingReportForProbationRegionFilename(probationRegion)).as('filename')
})

Then('I should download a booking report', () => {
  cy.then(function _() {
    const filePath = path.join(Cypress.config('downloadsFolder'), this.filename)

    cy.readFile(filePath).should('have.length.above', 0)
  })
})
