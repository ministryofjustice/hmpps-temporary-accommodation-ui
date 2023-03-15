import type { NewDeparture } from '@approved-premises/api'
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
}
