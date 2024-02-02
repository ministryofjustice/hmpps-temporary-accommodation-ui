import type { ProbationRegion } from '@approved-premises/api'
import { ReportType } from '@approved-premises/ui'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import { exact } from '../../../../server/utils/utils'
import Page from '../../page'

export default class ReportNewPage extends Page {
  constructor() {
    super('Reports')
  }

  static visit(): ReportNewPage {
    cy.visit(paths.reports.new({}))
    return new ReportNewPage()
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

  completeForm(month: string, year: string): void {
    this.getLabel('Month')
    this.getSelectInputByIdAndSelectAnEntry('month', month)

    this.getLabel('Year')
    this.getSelectInputByIdAndSelectAnEntry('year', year)
  }

  clearForm(): void {
    this.getSelectInputByIdAndSelectAnEntry('probationRegionId', '')
    this.getSelectInputByIdAndSelectAnEntry('month', '')
    this.getSelectInputByIdAndSelectAnEntry('year', '')
  }

  clickDownload(type: ReportType): void {
    if (type === 'bedspace-usage') {
      cy.get('button').contains('Download bedspace usage').click()
    } else if (type === 'bookings') {
      cy.get('button').contains('Download booking data').click()
    } else if (type === 'occupancy') {
      cy.get('button').contains('Download occupancy report').click()
    } else if (type === 'referrals') {
      cy.get('button').contains('Download referrals report').click()
    }
  }
}
