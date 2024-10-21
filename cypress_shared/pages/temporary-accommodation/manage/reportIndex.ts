import type { Cas3ReportType, ProbationRegion } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import { exact } from '../../../../server/utils/utils'
import Page from '../../page'

export default class ReportIndexPage extends Page {
  constructor() {
    super('Reports')
  }

  static visit(): ReportIndexPage {
    cy.visit(paths.reports.index({}))
    return new ReportIndexPage()
  }

  shouldPreselectProbationRegion(probationRegion: ProbationRegion): void {
    cy.get('label')
      .contains('Select a probation region')
      .siblings('select')
      .children('option')
      .should('have.length.above', 0)
      .contains(exact(probationRegion.name))
      .should('be.selected')
  }

  completeForm(startDate: string, endDate: string, probationRegionId?: string): void {
    if (probationRegionId) {
      this.getSelectInputByIdAndSelectAnEntry('probationRegionId', probationRegionId)
    }

    this.getLabel('Start date')
    this.getTextInputByIdAndEnterDetails('startDate', startDate)

    this.getLabel('End date')
    this.getTextInputByIdAndEnterDetails('endDate', endDate)
  }

  clearForm(): void {
    this.getSelectInputByIdAndSelectAnEntry('probationRegionId', '')
    this.getTextInputByIdAndClear('startDate')
    this.getTextInputByIdAndClear('endDate')
  }

  clickDownload(type: Cas3ReportType): void {
    if (type === 'bedUsage') {
      cy.get('button').contains('Download bedspace usage').click()
    } else if (type === 'booking') {
      cy.get('button').contains('Download booking data').click()
    } else if (type === 'futureBookings') {
      cy.get('button').contains('Download future bookings report').click()
    } else if (type === 'bedOccupancy') {
      cy.get('button').contains('Download occupancy report').click()
    } else if (type === 'referral') {
      cy.get('button').contains('Download referrals report').click()
    }
  }

  shouldNotShowErrors() {
    cy.get('.govuk-error-summary').should('not.exist')
    cy.get('.govuk-form-group--error').should('not.exist')
    cy.get('.govuk-error-message').should('not.exist')
  }
}
