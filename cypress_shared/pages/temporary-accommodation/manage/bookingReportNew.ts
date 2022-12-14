import type { ProbationRegion } from '@approved-premises/api'
import Page from '../../page'

export default class BookingReportNewPage extends Page {
  constructor() {
    super('Booking reports')
  }

  completeForm(probationRegion: ProbationRegion): void {
    this.getLabel('Select a probation region')
    this.getSelectInputByIdAndSelectAnEntry('probationRegionId', probationRegion.id)

    this.clickSubmit()
  }
}
