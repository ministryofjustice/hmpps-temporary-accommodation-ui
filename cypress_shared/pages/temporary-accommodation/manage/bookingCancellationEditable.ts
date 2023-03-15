import type { NewCancellation } from '@approved-premises/api'
import Page from '../../page'

export default class BookingCancellationEditablePage extends Page {
  completeForm(newCancellation: NewCancellation): void {
    this.getLegend('When was this booking cancelled?')
    this.completeDateInputs('date', newCancellation.date)

    this.getLabel('What was the reason for cancellation?')
    this.getSelectInputByIdAndSelectAnEntry('reason', newCancellation.reason)

    this.getLabel('Please provide any further details')
    this.getTextInputByIdAndEnterDetails('notes', newCancellation.notes)

    this.clickSubmit()
  }
}
