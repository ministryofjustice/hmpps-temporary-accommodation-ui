import type { NewCancellation } from '@approved-premises/api'
import { Cancellation } from '../../../../server/@types/shared'
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

  clearForm() {
    this.clearDateInputs('date')
    this.getSelectInputByIdAndSelectAnEntry('reason', '')
    this.getTextInputByIdAndClear('notes')
  }

  protected shouldShowFormContents(cancellation: Cancellation) {
    this.shouldShowDateInputs('date', cancellation.date)
    this.shouldShowSelectInput('reason', cancellation.reason.name)
    this.shouldShowTextareaInput('notes', cancellation.notes)
  }
}
