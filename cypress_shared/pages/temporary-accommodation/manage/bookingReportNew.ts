import type { ProbationRegion } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import { exact } from '../../../../server/utils/utils'
import Page from '../../page'

export default class BookingReportNewPage extends Page {
  constructor() {
    super('Booking reports')
  }

  static visit(): BookingReportNewPage {
    cy.visit(paths.reports.bookings.new({}))
    return new BookingReportNewPage()
  }

  shouldPreselectProbationRegion(probationRegion: ProbationRegion): void {
    cy.get('label')
      .contains('Select a probation region')
      .siblings('select')
      .children('option')
      .should('have.length', 2)
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
}