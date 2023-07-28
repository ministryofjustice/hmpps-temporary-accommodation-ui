import path from 'path'
import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import ReportNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/reportNew'
import { probationRegionFactory } from '../../../../server/testutils/factories'
import { reportForProbationRegionFilename } from '../../../../server/utils/reportUtils'
import { getUrlEncodedCypressEnv, throwMissingCypressEnvError } from '../utils'

const actingUserProbationRegionId =
  Cypress.env('acting_user_probation_region_id') || throwMissingCypressEnvError('acting_user_probation_region_id')
const actingUserProbationRegionName =
  getUrlEncodedCypressEnv('acting_user_probation_region_name') ||
  throwMissingCypressEnvError('acting_user_probation_region_name')

Given("I'm downloading a report", () => {
  const dashboardPage = Page.verifyOnPage(DashboardPage)

  dashboardPage.clickReportsLink()
})

Given('I download a booking report for the preselected probation region', () => {
  const reportPage = Page.verifyOnPage(ReportNewPage)

  const probationRegion = probationRegionFactory.build({
    id: actingUserProbationRegionId,
    name: actingUserProbationRegionName,
  })
  const month = '1'
  const year = '2023'
  const type = 'bookings'

  reportPage.shouldPreselectProbationRegion(probationRegion)
  reportPage.completeForm(month, year)
  reportPage.expectDownload(10000)
  reportPage.clickDownload(type)

  cy.wrap(reportForProbationRegionFilename(probationRegion, month, year, type)).as('filename')
})

Given('I download a bedspace usage report for the preselected probation region', () => {
  const reportPage = Page.verifyOnPage(ReportNewPage)

  const probationRegion = probationRegionFactory.build({
    id: actingUserProbationRegionId,
    name: actingUserProbationRegionName,
  })
  const month = '7'
  const year = '2023'
  const type = 'bedspace-usage'

  reportPage.shouldPreselectProbationRegion(probationRegion)
  reportPage.completeForm(month, year)
  reportPage.expectDownload(10000)
  reportPage.clickDownload(type)

  cy.wrap(reportForProbationRegionFilename(probationRegion, month, year, type)).as('filename')
})

Given('I download an occupancy report for the preselected probation region', () => {
  const reportPage = Page.verifyOnPage(ReportNewPage)

  const probationRegion = probationRegionFactory.build({
    id: actingUserProbationRegionId,
    name: actingUserProbationRegionName,
  })
  const month = '7'
  const year = '2023'
  const type = 'occupancy'

  reportPage.shouldPreselectProbationRegion(probationRegion)
  reportPage.completeForm(month, year)
  reportPage.expectDownload(10000)
  reportPage.clickDownload(type)

  cy.wrap(reportForProbationRegionFilename(probationRegion, month, year, type)).as('filename')
})

Given('I clear the form and attempt to download a booking report', () => {
  const reportPage = Page.verifyOnPage(ReportNewPage)

  reportPage.clearForm()
  reportPage.clickDownload('bookings')

  cy.wrap(['probationRegionId', 'month', 'year']).as('missing')
})

Then('I should download a report', () => {
  cy.then(function _() {
    const filePath = path.join(Cypress.config('downloadsFolder'), this.filename)

    cy.readFile(filePath).should('have.length.above', 0)
  })
})

Then('I should see a list of the problems encountered downloading the report', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(ReportNewPage)
    page.shouldShowErrorMessagesForFields(this.missing)
  })
})
