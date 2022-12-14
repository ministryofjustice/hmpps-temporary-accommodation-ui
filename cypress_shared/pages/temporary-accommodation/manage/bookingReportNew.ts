import type { ProbationRegion } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import Page from '../../page'

export default class BookingReportNewPage extends Page {
  constructor() {
    super('Booking reports')
  }

  static visit(): BookingReportNewPage {
    cy.visit(paths.reports.bookings.new({}))
    return new BookingReportNewPage()
  }

  completeForm(probationRegion: ProbationRegion): void {
    this.getLabel('Select a probation region')
    this.getSelectInputByIdAndSelectAnEntry('probationRegionId', probationRegion.id)

    this.clickSubmit()
  }
}
