import type { NewDeparture } from '@approved-premises/api'
import { Departure } from '../../../../server/@types/shared'
import Page from '../../page'

export default class BookingDepartureEditablePage extends Page {
  completeForm(newDeparture: NewDeparture): void {
    this.getLegend('What was the departure date?')
    this.completeDateInputs('dateTime', newDeparture.dateTime)

    this.getLabel('What was the departure reason?')
    this.getSelectInputByIdAndSelectAnEntry('reasonId', newDeparture.reasonId)

    this.getLabel('What was the move on category?')
    this.getSelectInputByIdAndSelectAnEntry('moveOnCategoryId', newDeparture.moveOnCategoryId)

    this.getLabel('Please provide any further details')
    this.getTextInputByIdAndEnterDetails('notes', newDeparture.notes)

    this.clickSubmit()
  }

  clearForm() {
    this.clearDateInputs('dateTime')
    this.getSelectInputByIdAndSelectAnEntry('reasonId', '')
    this.getSelectInputByIdAndSelectAnEntry('moveOnCategoryId', '')
    this.getTextInputByIdAndClear('notes')
  }

  protected shouldShowFormContents(departure: Departure) {
    this.shouldShowDateInputs('dateTime', departure.dateTime)
    this.shouldShowSelectInput('reasonId', departure.reason.name)
    this.shouldShowSelectInput('moveOnCategoryId', departure.moveOnCategory.name)
    this.shouldShowTextareaInput('notes', departure.notes)
  }
}
