import path from 'path'
import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import { Cas3ReportType } from '@approved-premises/api'
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
  const startDate = '2024-03-01'
  const endDate = '2024-04-01'
  const type: Cas3ReportType = 'booking'

  reportPage.shouldPreselectProbationRegion(probationRegion)
  reportPage.completeForm(startDate, endDate)
  reportPage.expectDownload(10000)
  reportPage.clickDownload(type)

  cy.wrap(reportForProbationRegionFilename(probationRegion.name, startDate, endDate, type)).as('filename')
})

Given('I download a bedspace usage report for the preselected probation region', () => {
  const reportPage = Page.verifyOnPage(ReportNewPage)

  const probationRegion = probationRegionFactory.build({
    id: actingUserProbationRegionId,
    name: actingUserProbationRegionName,
  })
  const startDate = '2024-03-01'
  const endDate = '2024-04-01'
  const type: Cas3ReportType = 'bedUsage'

  reportPage.shouldPreselectProbationRegion(probationRegion)
  reportPage.completeForm(startDate, endDate)
  reportPage.expectDownload(10000)
  reportPage.clickDownload(type)

  cy.wrap(reportForProbationRegionFilename(probationRegion.name, startDate, endDate, type)).as('filename')
})

Given('I download an occupancy report for the preselected probation region', () => {
  const reportPage = Page.verifyOnPage(ReportNewPage)

  const probationRegion = probationRegionFactory.build({
    id: actingUserProbationRegionId,
    name: actingUserProbationRegionName,
  })
  const startDate = '2024-03-01'
  const endDate = '2024-04-01'
  const type: Cas3ReportType = 'bedOccupancy'

  reportPage.shouldPreselectProbationRegion(probationRegion)
  reportPage.completeForm(startDate, endDate)
  reportPage.expectDownload(10000)
  reportPage.clickDownload(type)

  cy.wrap(reportForProbationRegionFilename(probationRegion.name, startDate, endDate, type)).as('filename')
})

Given('I clear the form and attempt to download a booking report', () => {
  const reportPage = Page.verifyOnPage(ReportNewPage)

  reportPage.clearForm()
  reportPage.clickDownload('booking')

  cy.wrap(['probationRegionId', 'startDate', 'endDate']).as('missing')
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
