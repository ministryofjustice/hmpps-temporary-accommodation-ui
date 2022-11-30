import type { Booking, NewDeparture } from '@approved-premises/api'
import { DateFormats } from '../../../../server/utils/dateUtils'
import Page from '../../page'

export default class BookingDepartureNewPage extends Page {
  constructor(private readonly booking: Booking) {
    super('Mark booking as closed')
  }

  shouldShowBookingDetails(): void {
    cy.get('.location-header').within(() => {
      cy.get('p').should('contain', this.booking.person.crn)
    })

    this.shouldShowKeyAndValue('Arrival date', DateFormats.isoDateToUIDate(this.booking.arrival.arrivalDate))
    this.shouldShowKeyAndValue(
      'Expected departure date',
      DateFormats.isoDateToUIDate(this.booking.arrival.expectedDepartureDate),
    )
    this.shouldShowKeyAndValues('Notes', this.booking.arrival.notes.split('\n'))

    this.shouldShowDateInputs('dateTime', this.booking.arrival.expectedDepartureDate)
  }

  completeForm(newDeparture: NewDeparture): void {
    this.clearForm()

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

  clearForm(): void {
    this.clearDateInputs('dateTime')
  }
}
