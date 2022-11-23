import type { Booking, NewConfirmation } from '@approved-premises/api'
import { DateFormats } from '../../../../server/utils/dateUtils'
import Page from '../../page'

export default class BookingConfirmationNewPage extends Page {
  constructor(private readonly booking: Booking) {
    super('Mark booking as confirmed')
  }

  shouldShowBookingDetails(): void {
    cy.get('.location-header').within(() => {
      cy.get('p').should('contain', this.booking.person.crn)
    })

    this.shouldShowKeyAndValue('Start date', DateFormats.isoDateToUIDate(this.booking.arrivalDate))
    this.shouldShowKeyAndValue('End date', DateFormats.isoDateToUIDate(this.booking.departureDate))
  }

  completeForm(newConfirmation: NewConfirmation): void {
    this.getLabel('Please provide any further details')
    this.getTextInputByIdAndEnterDetails('notes', newConfirmation.notes)

    this.clickSubmit()
  }
}
